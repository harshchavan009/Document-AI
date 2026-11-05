import os
import logging
from typing import List, Dict, Any, Optional
from backend.app.config import settings

logger = logging.getLogger(__name__)


class VectorStoreError(Exception):
    """Raised when vector database operations fail."""
    pass


class VectorStoreService:
    """
    Persistent vector database service using ChromaDB PersistentClient.
    Enforces collection metadata integrity, workspace isolation, and clean deletion.
    """

    def __init__(self):
        self.chroma_path = os.path.abspath(settings.CHROMA_DIR)
        os.makedirs(self.chroma_path, exist_ok=True)
        self._client = None
        self._collection = None

    def get_client(self):
        """Initializes and returns the persistent ChromaDB client."""
        if self._client is None:
            try:
                import chromadb
                self._client = chromadb.PersistentClient(path=self.chroma_path)
            except ImportError:
                raise VectorStoreError("ChromaDB library is not installed in the environment.")
            except Exception as e:
                raise VectorStoreError(f"Failed to initialize ChromaDB PersistentClient: {str(e)}")
        return self._client

    def get_collection(self):
        """Retrieves or creates the vector collection with cosine distance metric."""
        if self._collection is None:
            client = self.get_client()
            try:
                self._collection = client.get_or_create_collection(
                    name="documind_vectors",
                    metadata={
                        "hnsw:space": "cosine",
                        "model": settings.EMBEDDING_MODEL,
                        "dimensions": settings.EMBEDDING_DIMENSIONS
                    }
                )
            except Exception as e:
                raise VectorStoreError(f"Failed to access vector collection: {str(e)}")
        return self._collection

    def add_chunks(
        self,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]],
        workspace_id: str,
        document_id: str,
        filename: str
    ) -> None:
        """
        Inserts document chunks and corresponding dense vectors with isolation metadata.
        """
        if not chunks or not embeddings:
            return

        if len(chunks) != len(embeddings):
            raise VectorStoreError(
                f"Mismatch: received {len(chunks)} chunks and {len(embeddings)} embeddings."
            )

        collection = self.get_collection()

        ids = [c["id"] for c in chunks]
        documents = [c["text_content"] for c in chunks]
        metadatas = [
            {
                "workspace_id": str(workspace_id),
                "document_id": str(document_id),
                "filename": filename,
                "page_number": int(c.get("page_number", 1)),
                "chunk_index": int(c.get("chunk_index", 0)),
                "char_start": int(c.get("character_start", 0)),
                "char_end": int(c.get("character_end", 0))
            }
            for c in chunks
        ]

        try:
            collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )
        except Exception as e:
            raise VectorStoreError(f"Failed to insert vectors into ChromaDB: {str(e)}")

    def query_similar(
        self,
        query_vector: List[float],
        workspace_id: str,
        document_ids: Optional[List[str]] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Performs similarity search scoped to the workspace and optional document filter.
        Returns parsed results with text, metadata, and calculated cosine distances.
        """
        collection = self.get_collection()

        # Construct isolation filter
        if document_ids and len(document_ids) > 0:
            if len(document_ids) == 1:
                where_filter = {
                    "$and": [
                        {"workspace_id": str(workspace_id)},
                        {"document_id": str(document_ids[0])}
                    ]
                }
            else:
                where_filter = {
                    "$and": [
                        {"workspace_id": str(workspace_id)},
                        {"document_id": {"$in": [str(d) for d in document_ids]}}
                    ]
                }
        else:
            where_filter = {"workspace_id": str(workspace_id)}

        try:
            results = collection.query(
                query_embeddings=[query_vector],
                n_results=top_k,
                where=where_filter,
                include=["documents", "metadatas", "distances"]
            )
        except Exception as e:
            raise VectorStoreError(f"Vector search failed: {str(e)}")

        formatted = []
        if not results or not results.get("ids") or len(results["ids"][0]) == 0:
            return formatted

        retrieved_ids = results["ids"][0]
        retrieved_docs = results["documents"][0]
        retrieved_metas = results["metadatas"][0]
        retrieved_distances = results["distances"][0]

        for i in range(len(retrieved_ids)):
            meta = retrieved_metas[i] if retrieved_metas else {}
            dist = float(retrieved_distances[i]) if retrieved_distances else 1.0
            formatted.append({
                "chunk_id": retrieved_ids[i],
                "text_content": retrieved_docs[i],
                "document_id": meta.get("document_id", ""),
                "filename": meta.get("filename", "Unknown Document"),
                "page_number": int(meta.get("page_number", 1)),
                "chunk_index": int(meta.get("chunk_index", 0)),
                "relevance_distance": round(dist, 4)
            })

        return formatted

    def delete_document(self, document_id: str) -> None:
        """Deletes all vector embeddings associated with a document ID."""
        collection = self.get_collection()
        try:
            collection.delete(where={"document_id": str(document_id)})
        except Exception as e:
            logger.warning(f"ChromaDB delete for doc {document_id} raised: {str(e)}")

    def delete_workspace(self, workspace_id: str) -> None:
        """Deletes all vector embeddings associated with a workspace ID."""
        collection = self.get_collection()
        try:
            collection.delete(where={"workspace_id": str(workspace_id)})
        except Exception as e:
            logger.warning(f"ChromaDB delete for workspace {workspace_id} raised: {str(e)}")

