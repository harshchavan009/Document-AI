import logging
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal
from backend.app.models import Document, DocumentChunk
from backend.app.services.extraction_service import ExtractionService
from backend.app.services.chunking_service import ChunkingService
from backend.app.services.embedding_service import EmbeddingService
from backend.app.services.vector_store import VectorStoreService
from backend.app.config import settings

logger = logging.getLogger(__name__)


class JobService:
    """
    Coordinates asynchronous document ingestion pipelines through distinct,
    auditable processing stages: Extracting -> Chunking -> Embeddings -> Indexing -> Ready.
    """

    @staticmethod
    def process_document(document_id: str) -> None:
        """
        Background task worker that executes full document ingestion.
        Uses a fresh database session for isolation.
        """
        db: Session = SessionLocal()
        try:
            doc = db.query(Document).filter(Document.id == document_id).first()
            if not doc:
                logger.error(f"Document {document_id} not found for processing.")
                return

            # Stage 1: Text Extraction
            doc.status = "Extracting"
            doc.error_message = None
            db.commit()

            try:
                pages = ExtractionService.extract_document(doc.storage_path, doc.file_type)
            except Exception as e:
                doc.status = "Failed"
                doc.error_message = f"Extraction failed: {str(e)}"
                db.commit()
                logger.error(f"Doc {document_id} extraction failed: {e}")
                return

            doc.page_count = len(pages)
            db.commit()

            # Stage 2: Chunking
            doc.status = "Chunking"
            db.commit()

            chunker = ChunkingService(
                chunk_size=settings.DEFAULT_CHUNK_SIZE,
                chunk_overlap=settings.DEFAULT_CHUNK_OVERLAP
            )
            raw_chunks = chunker.chunk_document(doc.id, pages)

            if not raw_chunks:
                doc.status = "Failed"
                doc.error_message = "Document generated 0 chunks after text extraction."
                db.commit()
                return

            # Save chunks to database
            # Clear any existing chunks for reprocessing
            db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).delete()

            db_chunks = []
            chunk_texts = []
            for rc in raw_chunks:
                chunk_obj = DocumentChunk(
                    id=rc["id"],
                    document_id=doc.id,
                    chunk_index=rc["chunk_index"],
                    page_number=rc["page_number"],
                    character_start=rc["character_start"],
                    character_end=rc["character_end"],
                    text_content=rc["text_content"],
                    token_count=rc["token_count"]
                )
                db_chunks.append(chunk_obj)
                chunk_texts.append(rc["text_content"])

            db.add_all(db_chunks)
            doc.chunk_count = len(db_chunks)
            db.commit()

            # Stage 3: Embedding Generation
            doc.status = "Generating embeddings"
            db.commit()

            embedder = EmbeddingService()
            try:
                embeddings = embedder.embed_documents(chunk_texts)
            except Exception as e:
                doc.status = "Failed"
                doc.error_message = f"Embedding generation failed: {str(e)}"
                db.commit()
                logger.error(f"Doc {document_id} embedding failed: {e}")
                return

            # Stage 4: Vector Indexing in ChromaDB
            doc.status = "Indexing"
            db.commit()

            vector_store = VectorStoreService()
            try:
                # Remove stale vectors if reprocessing
                vector_store.delete_document(doc.id)
                vector_store.add_chunks(
                    chunks=raw_chunks,
                    embeddings=embeddings,
                    workspace_id=doc.workspace_id,
                    document_id=doc.id,
                    filename=doc.filename
                )
            except Exception as e:
                doc.status = "Failed"
                doc.error_message = f"Vector indexing failed: {str(e)}"
                db.commit()
                logger.error(f"Doc {document_id} indexing failed: {e}")
                return

            # Stage 5: Ready
            doc.status = "Ready"
            doc.error_message = None
            db.commit()
            logger.info(f"Document {document_id} successfully indexed with {len(raw_chunks)} chunks.")

        except Exception as e:
            logger.exception(f"Unexpected error processing document {document_id}: {e}")
            try:
                doc = db.query(Document).filter(Document.id == document_id).first()
                if doc:
                    doc.status = "Failed"
                    doc.error_message = f"Unexpected processing error: {str(e)}"
                    db.commit()
            except Exception:
                pass
        finally:
            db.close()

    @staticmethod
    def recover_orphan_jobs(db: Session = None) -> int:
        """
        Recovers document ingestion jobs that were interrupted in intermediate states
        by a server restart or deployment crash. Resets them to Failed with a helpful message.
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            interrupted = (
                db.query(Document)
                .filter(Document.status.in_(["Uploaded", "Extracting", "Chunking", "Embedding", "Indexing"]))
                .all()
            )
            count = len(interrupted)
            if count > 0:
                logger.warning(f"Found {count} interrupted document ingestion jobs. Recovering state...")
                for doc in interrupted:
                    doc.status = "Failed"
                    doc.error_message = "Ingestion interrupted by server restart. Click Retry to reprocess."
                db.commit()
                logger.info(f"Successfully recovered {count} orphan jobs.")
            return count
        except Exception as e:
            logger.error(f"Error during orphan job recovery: {e}")
            return 0
        finally:
            if close_session:
                db.close()

