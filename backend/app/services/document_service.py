import os
import logging
from typing import List, Tuple, Dict, Any
from fastapi import UploadFile, BackgroundTasks, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.models import Document, Workspace
from backend.app.config import settings
from backend.app.utils.file_utils import (
    compute_sha256,
    verify_magic_bytes,
    generate_storage_path
)
from backend.app.utils.security import sanitize_filename
from backend.app.utils.validation import validate_file_metadata
from backend.app.services.job_service import JobService
from backend.app.services.vector_store import VectorStoreService

logger = logging.getLogger(__name__)


class DocumentService:
    """Handles document uploads, duplicate checks, physical storage, and lifecycle."""

    @staticmethod
    async def upload_files(
        workspace_id: str,
        files: List[UploadFile],
        db: Session,
        background_tasks: BackgroundTasks
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, str]]]:
        """
        Validates, saves, records, and queues background processing for uploaded files.
        Returns (uploaded_items, rejected_items).
        """
        workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found"
            )

        uploaded = []
        rejected = []

        for file in files:
            safe_name = sanitize_filename(file.filename or "uploaded_file")

            # Check size via content length or seek
            file.file.seek(0, os.SEEK_END)
            size = file.file.tell()
            file.file.seek(0)

            is_valid_meta, meta_err = validate_file_metadata(safe_name, size)
            if not is_valid_meta:
                rejected.append({"filename": safe_name, "reason": meta_err})
                continue

            file_bytes = await file.read()

            # Magic bytes check
            is_valid_magic, verified_mime, magic_err = verify_magic_bytes(file_bytes, safe_name)
            if not is_valid_magic:
                rejected.append({"filename": safe_name, "reason": magic_err})
                continue

            # Upfront PDF page count limit check
            ext = os.path.splitext(safe_name)[1].lower()
            if ext == ".pdf":
                try:
                    import pymupdf as fitz
                except ImportError:
                    try:
                        import fitz
                    except ImportError:
                        fitz = None
                if fitz:
                    try:
                        with fitz.open(stream=file_bytes, filetype="pdf") as pdf_doc:
                            if len(pdf_doc) > settings.MAX_PDF_PAGES:
                                rejected.append({
                                    "filename": safe_name,
                                    "reason": f"PDF exceeds maximum limit of {settings.MAX_PDF_PAGES} pages ({len(pdf_doc)} pages found)."
                                })
                                continue
                    except Exception:
                        pass

            # SHA-256 duplicate detection
            file_hash = compute_sha256(file_bytes)
            duplicate = (
                db.query(Document)
                .filter(Document.workspace_id == workspace_id, Document.file_hash == file_hash)
                .first()
            )
            if duplicate and duplicate.status == "Ready":
                rejected.append({
                    "filename": safe_name,
                    "reason": f"An identical document '{duplicate.filename}' is already indexed in this workspace."
                })
                continue

            ext = os.path.splitext(safe_name)[1].lower()
            file_id, disk_path = generate_storage_path(settings.UPLOADS_DIR, ext)

            # Write file to safe disk path
            with open(disk_path, "wb") as out_f:
                out_f.write(file_bytes)

            doc = Document(
                id=file_id,
                workspace_id=workspace_id,
                filename=safe_name,
                storage_path=disk_path,
                file_type=verified_mime,
                file_size=size,
                file_hash=file_hash,
                status="Uploaded"
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)

            # Queue background processing
            background_tasks.add_task(JobService.process_document, doc.id)

            uploaded.append({
                "id": doc.id,
                "filename": doc.filename,
                "file_size": doc.file_size,
                "file_type": doc.file_type,
                "status": doc.status,
                "created_at": doc.created_at
            })

        return uploaded, rejected

    @staticmethod
    def get_document_by_id(document_id: str, db: Session) -> Document:
        """Fetches document by ID or raises 404."""
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID '{document_id}' not found"
            )
        return doc

    @staticmethod
    def delete_document(document_id: str, db: Session) -> None:
        """
        Permanently purges document from disk, ChromaDB, and database.
        """
        doc = DocumentService.get_document_by_id(document_id, db)

        # 1. Purge from ChromaDB
        try:
            vector_store = VectorStoreService()
            vector_store.delete_document(doc.id)
        except Exception as e:
            logger.warning(f"ChromaDB vector cleanup error for {doc.id}: {e}")

        # 2. Delete file from storage disk
        if doc.storage_path and os.path.exists(doc.storage_path):
            try:
                os.remove(doc.storage_path)
            except Exception as e:
                logger.warning(f"Disk file deletion error for {doc.storage_path}: {e}")

        # 3. Delete from SQLite (chunks cascade automatically)
        db.delete(doc)
        db.commit()

    @staticmethod
    def reprocess_document(document_id: str, db: Session, background_tasks: BackgroundTasks) -> Document:
        """Resets document state and queues background re-indexing."""
        doc = DocumentService.get_document_by_id(document_id, db)
        doc.status = "Uploaded"
        doc.error_message = None
        db.commit()
        db.refresh(doc)

        background_tasks.add_task(JobService.process_document, doc.id)
        return doc

    @staticmethod
    def ingest_sample_document(workspace_id: str, db: Session, background_tasks: BackgroundTasks) -> Document:
        """
        Ingests the bundled sample research paper into the workspace.
        """
        workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found"
            )

        asset_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "sample_document.txt")
        if not os.path.exists(asset_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bundled sample document asset not found"
            )

        with open(asset_path, "rb") as f:
            file_bytes = f.read()

        filename = "Attention_Is_All_You_Need.txt"
        file_hash = compute_sha256(file_bytes)
        os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
        file_id, storage_path = generate_storage_path(settings.UPLOADS_DIR, ".txt")
        with open(storage_path, "wb") as f:
            f.write(file_bytes)

        existing = db.query(Document).filter(
            Document.workspace_id == workspace_id,
            Document.file_hash == file_hash
        ).first()
        if existing:
            return existing

        doc = Document(
            workspace_id=workspace_id,
            filename=filename,
            file_type="text/plain",
            file_size=len(file_bytes),
            file_hash=file_hash,
            storage_path=storage_path,
            status="Uploaded"
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        background_tasks.add_task(JobService.process_document, doc.id)
        return doc


