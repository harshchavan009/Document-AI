import time
import logging
from typing import List
from backend.app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingError(Exception):
    """Raised when embedding generation fails."""
    pass


class EmbeddingService:
    """
    Embedding service using the official Google Gen AI Python SDK.
    Enforces identical dimensionality and task-specific optimization.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.EMBEDDING_MODEL
        self.dimensions = settings.EMBEDDING_DIMENSIONS
        self._client = None

    def get_client(self):
        """Initializes and returns the Google Gen AI Client."""
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            raise EmbeddingError(
                "Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env."
            )
        if self._client is None:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except ImportError:
                raise EmbeddingError(
                    "The google-genai SDK is not installed in the Python environment."
                )
            except Exception as e:
                raise EmbeddingError(f"Failed to initialize Google Gen AI client: {str(e)}")
        return self._client

    def embed_documents(self, texts: List[str], batch_size: int = 16) -> List[List[float]]:
        """
        Generates dense vector embeddings for document chunks using RETRIEVAL_DOCUMENT task type.
        Includes batching and exponential backoff for rate limit handling.
        """
        if not texts:
            return []

        client = self.get_client()
        from google.genai import types

        all_embeddings: List[List[float]] = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            max_retries = 4
            base_delay = 1.5

            for attempt in range(max_retries):
                try:
                    response = client.models.embed_content(
                        model=self.model,
                        contents=batch,
                        config=types.EmbedContentConfig(
                            task_type="RETRIEVAL_DOCUMENT",
                            output_dimensionality=self.dimensions
                        )
                    )
                    for emb in response.embeddings:
                        all_embeddings.append(emb.values)
                    break
                except Exception as e:
                    err_str = str(e).lower()
                    if ("429" in err_str or "rate" in err_str or "quota" in err_str) and attempt < max_retries - 1:
                        sleep_time = base_delay * (2 ** attempt)
                        logger.warning(f"Rate limited by Gemini API. Retrying in {sleep_time:.1f}s...")
                        time.sleep(sleep_time)
                    else:
                        raise EmbeddingError(f"Failed to generate document embeddings: {str(e)}")

        return all_embeddings

    def embed_query(self, query: str) -> List[float]:
        """
        Generates a vector embedding for a retrieval query using RETRIEVAL_QUERY task type.
        """
        clean_query = query.strip()
        if not clean_query:
            raise EmbeddingError("Search query cannot be empty.")

        client = self.get_client()
        from google.genai import types

        max_retries = 3
        base_delay = 1.0

        for attempt in range(max_retries):
            try:
                response = client.models.embed_content(
                    model=self.model,
                    contents=clean_query,
                    config=types.EmbedContentConfig(
                        task_type="RETRIEVAL_QUERY",
                        output_dimensionality=self.dimensions
                    )
                )
                if response.embeddings and len(response.embeddings) > 0:
                    return response.embeddings[0].values
                raise EmbeddingError("No embedding returned from Gemini API for query.")
            except Exception as e:
                err_str = str(e).lower()
                if ("429" in err_str or "rate" in err_str or "quota" in err_str) and attempt < max_retries - 1:
                    sleep_time = base_delay * (2 ** attempt)
                    time.sleep(sleep_time)
                else:
                    raise EmbeddingError(f"Failed to generate query embedding: {str(e)}")

        raise EmbeddingError("Exhausted retries while generating query embedding.")

