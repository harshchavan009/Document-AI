import re
import logging
from typing import List, Dict, Any, Tuple, Generator
from backend.app.config import settings
from backend.app.services.retrieval_service import RetrievalService
from backend.app.prompts.rag_prompts import RAG_SYSTEM_PROMPT, format_context_block

logger = logging.getLogger(__name__)

INSUFFICIENT_CONTEXT_MESSAGE = (
    "I could not find sufficient information in your selected documents to answer this question accurately. "
    "Try refining your question or selecting additional relevant documents."
)


class RAGService:
    """
    RAG service providing grounded generation, streaming answers,
    and server-side citation validation.
    """

    def __init__(self, retrieval_service: Optional[RetrievalService] = None):
        self.retrieval_service = retrieval_service or RetrievalService()

    @staticmethod
    def extract_and_validate_citations(
        generated_answer: str,
        retrieved_sources: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Parses all [X] citation markers in the answer and validates that
        every cited index genuinely exists in the retrieved sources set.
        Verifies that all returned citations match retrieved chunks.
        """
        if not generated_answer or not retrieved_sources:
            return []

        # Find all brackets containing digits, e.g. [1], [2]
        matches = re.findall(r'\[(\d+)\]', generated_answer)
        cited_indices = set(int(m) for m in matches)

        source_by_index = {
            src.get("citation_index"): src for src in retrieved_sources if "citation_index" in src
        }

        verified_citations = []
        for idx in sorted(cited_indices):
            if idx in source_by_index:
                src = source_by_index[idx]
                verified_citations.append({
                    "citation_index": idx,
                    "document_id": src.get("document_id", ""),
                    "filename": src.get("filename", ""),
                    "page_number": src.get("page_number", 1),
                    "chunk_id": src.get("chunk_id", ""),
                    "excerpt": src.get("text_content", ""),
                    "relevance_score": src.get("relevance_distance", 0.0)
                })

        # If answer mentions no explicit citations but sources were retrieved and used,
        # attach the primary retrieved sources for transparency
        if not verified_citations and retrieved_sources:
            for src in retrieved_sources[:3]:
                verified_citations.append({
                    "citation_index": src.get("citation_index", 1),
                    "document_id": src.get("document_id", ""),
                    "filename": src.get("filename", ""),
                    "page_number": src.get("page_number", 1),
                    "chunk_id": src.get("chunk_id", ""),
                    "excerpt": src.get("text_content", ""),
                    "relevance_score": src.get("relevance_distance", 0.0)
                })

        return verified_citations

    def generate_answer(
        self,
        workspace_id: str,
        question: str,
        document_ids: Optional[List[str]] = None,
        history: Optional[List[Dict[str, str]]] = None,
        top_k: int = 5,
        relevance_threshold: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Executes complete RAG pipeline synchronously (or non-streamed).
        """
        # Step 1: Follow-up query rewriting if history exists
        standalone_query = question
        if history and len(history) > 0:
            standalone_query = self.retrieval_service.rewrite_followup_query(history, question)

        # Step 2: Semantic retrieval with distance thresholding
        retrieved_chunks, _ = self.retrieval_service.retrieve_context(
            workspace_id=workspace_id,
            question=standalone_query,
            document_ids=document_ids,
            top_k=top_k,
            relevance_threshold=relevance_threshold
        )

        # Step 3: Handle insufficient context immediately
        if not retrieved_chunks:
            return {
                "answer": INSUFFICIENT_CONTEXT_MESSAGE,
                "sources": [],
                "standalone_query": standalone_query,
                "retrieved_count": 0
            }

        # Step 4: Assemble prompt
        context_text = format_context_block(retrieved_chunks)
        user_prompt = (
            f"Retrieved Document Context:\n{context_text}\n\n"
            f"User Question: {question}\n\n"
            f"Answer:"
        )

        # Step 5: Call Gemini Generation Model
        client = self.retrieval_service.embedding_service.get_client()
        from google.genai import types

        try:
            response = client.models.generate_content(
                model=settings.GENERATION_MODEL,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=RAG_SYSTEM_PROMPT,
                    temperature=0.2
                )
            )
            raw_answer = response.text.strip()
        except Exception as e:
            logger.error(f"Gemini generation call failed: {e}")
            raise RuntimeError(f"AI generation failed: {str(e)}")

        # Step 6: Server-side citation validation
        validated_sources = self.extract_and_validate_citations(raw_answer, retrieved_chunks)

        return {
            "answer": raw_answer,
            "sources": validated_sources,
            "standalone_query": standalone_query,
            "retrieved_count": len(retrieved_chunks)
        }

    def generate_answer_stream(
        self,
        workspace_id: str,
        question: str,
        document_ids: Optional[List[str]] = None,
        history: Optional[List[Dict[str, str]]] = None,
        top_k: int = 5,
        relevance_threshold: Optional[float] = None
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Yields Server-Sent Events containing progress, text deltas, and verified citations.
        """
        # Step 1: Query rewriting
        standalone_query = question
        if history and len(history) > 0:
            standalone_query = self.retrieval_service.rewrite_followup_query(history, question)

        yield {
            "event": "query_rewritten",
            "data": {"standalone_query": standalone_query}
        }

        # Step 2: Semantic retrieval
        retrieved_chunks, _ = self.retrieval_service.retrieve_context(
            workspace_id=workspace_id,
            question=standalone_query,
            document_ids=document_ids,
            top_k=top_k,
            relevance_threshold=relevance_threshold
        )

        yield {
            "event": "context_retrieved",
            "data": {
                "retrieved_count": len(retrieved_chunks),
                "has_sufficient_context": len(retrieved_chunks) > 0
            }
        }

        # Step 3: Handle insufficient context
        if not retrieved_chunks:
            yield {
                "event": "text_delta",
                "data": {"delta": INSUFFICIENT_CONTEXT_MESSAGE}
            }
            yield {
                "event": "sources_verified",
                "data": {"sources": []}
            }
            yield {"event": "done", "data": {}}
            return

        # Step 4: Stream generation
        context_text = format_context_block(retrieved_chunks)
        user_prompt = (
            f"Retrieved Document Context:\n{context_text}\n\n"
            f"User Question: {question}\n\n"
            f"Answer:"
        )

        client = self.retrieval_service.embedding_service.get_client()
        from google.genai import types

        accumulated_text = []

        try:
            stream = client.models.generate_content_stream(
                model=settings.GENERATION_MODEL,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=RAG_SYSTEM_PROMPT,
                    temperature=0.2
                )
            )
            for chunk in stream:
                if chunk.text:
                    accumulated_text.append(chunk.text)
                    yield {
                        "event": "text_delta",
                        "data": {"delta": chunk.text}
                    }
        except Exception as e:
            logger.error(f"Streaming generation failed: {e}")
            yield {
                "event": "error",
                "data": {"message": f"Generation failed: {str(e)}"}
            }
            return

        full_answer = "".join(accumulated_text)
        validated_sources = self.extract_and_validate_citations(full_answer, retrieved_chunks)

        yield {
            "event": "sources_verified",
            "data": {"sources": validated_sources}
        }
        yield {"event": "done", "data": {}}

