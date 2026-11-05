import logging
from typing import List, Dict, Any, Optional, Tuple
from backend.app.config import settings
from backend.app.services.embedding_service import EmbeddingService
from backend.app.services.vector_store import VectorStoreService
from backend.app.prompts.rag_prompts import QUERY_REWRITE_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class RetrievalService:
    """
    Coordinates semantic query embedding, multi-turn follow-up rewriting,
    scoped vector retrieval, and relevance threshold validation.
    """

    def __init__(
        self,
        embedding_service: Optional[EmbeddingService] = None,
        vector_store: Optional[VectorStoreService] = None
    ):
        self.embedding_service = embedding_service or EmbeddingService()
        self.vector_store = vector_store or VectorStoreService()

    def rewrite_followup_query(self, history: List[Dict[str, str]], current_question: str) -> str:
        """
        Rewrites a conversational follow-up question into a standalone retrieval query
        using Gemini if conversation context is present.
        """
        if not history or len(history) == 0:
            return current_question

        client = None
        try:
            client = self.embedding_service.get_client()
        except Exception as e:
            logger.warning(f"Could not initialize client for query rewriting, using verbatim: {e}")
            return current_question

        # Format conversation context
        history_lines = []
        for msg in history[-4:]:  # Take last 4 turns for context
            role = "User" if msg.get("role") == "user" else "Assistant"
            content = msg.get("content", "").strip()
            history_lines.append(f"{role}: {content}")

        context_str = "\n".join(history_lines)
        prompt = (
            f"{QUERY_REWRITE_SYSTEM_PROMPT}\n\n"
            f"Conversation History:\n{context_str}\n\n"
            f"New Follow-up Question: {current_question}\n\n"
            f"Standalone Search Query:"
        )

        try:
            response = client.models.generate_content(
                model=settings.GENERATION_MODEL,
                contents=prompt
            )
            rewritten = response.text.strip()
            if rewritten and len(rewritten) > 3:
                # Remove quotes if model wrapped query in quotes
                if (rewritten.startswith('"') and rewritten.endswith('"')) or (rewritten.startswith("'") and rewritten.endswith("'")):
                    rewritten = rewritten[1:-1].strip()
                return rewritten
        except Exception as e:
            logger.warning(f"Gemini query rewrite call failed: {e}. Falling back to verbatim query.")

        return current_question

    def retrieve_context(
        self,
        workspace_id: str,
        question: str,
        document_ids: Optional[List[str]] = None,
        top_k: int = 5,
        relevance_threshold: Optional[float] = None
    ) -> Tuple[List[Dict[str, Any]], str]:
        """
        Embeds query, searches ChromaDB with metadata filtering, and applies relevance threshold.
        Returns (filtered_chunks, standalone_query).
        """
        threshold = relevance_threshold if relevance_threshold is not None else settings.RELEVANCE_THRESHOLD

        # Generate query vector
        query_vector = self.embedding_service.embed_query(question)

        # Vector search in ChromaDB
        candidates = self.vector_store.query_similar(
            query_vector=query_vector,
            workspace_id=workspace_id,
            document_ids=document_ids,
            top_k=top_k
        )

        if not candidates:
            return [], question

        # Apply relevance threshold: lower cosine distance means closer similarity
        # Any chunk with distance > threshold is rejected
        filtered = []
        citation_index = 1
        for chunk in candidates:
            dist = chunk.get("relevance_distance", 1.0)
            if dist <= threshold:
                chunk["citation_index"] = citation_index
                filtered.append(chunk)
                citation_index += 1

        return filtered, question

