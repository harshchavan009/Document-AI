import os
import pytest
from unittest.mock import MagicMock
from backend.app.services.embedding_service import EmbeddingService, EmbeddingError
from backend.app.services.vector_store import VectorStoreService


def test_embedding_service_requires_api_key(monkeypatch):
    """Verifies that EmbeddingService refuses to run with missing or placeholder API key."""
    from backend.app.config import settings
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")

    embedder = EmbeddingService()
    with pytest.raises(EmbeddingError) as exc_info:
        embedder.get_client()

    assert "api key is not configured" in str(exc_info.value).lower()


def test_embedding_retry_on_rate_limit(monkeypatch):
    """Verifies exponential retry logic when Gemini returns rate limit errors."""
    from backend.app.config import settings
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test_key_12345")

    embedder = EmbeddingService()

    # Mock client and embed_content to fail once with 429 then succeed
    mock_client = MagicMock()
    mock_resp = MagicMock()
    mock_emb = MagicMock()
    mock_emb.values = [0.1] * 768
    mock_resp.embeddings = [mock_emb]

    call_count = 0

    def mock_embed(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            raise Exception("429 Resource Exhausted: Quota exceeded")
        return mock_resp

    mock_client.models.embed_content.side_effect = mock_embed
    embedder._client = mock_client

    result = embedder.embed_documents(["Test sentence for embedding"])
    assert len(result) == 1
    assert len(result[0]) == 768
    assert call_count == 2  # Proves retry happened after 429!


def test_vector_store_persistence_and_query(tmp_path):
    """
    Verifies that ChromaDB PersistentClient persists vectors to disk,
    can be re-opened in a new instance, and correctly executes similarity queries.
    """
    chroma_dir = str(tmp_path / "chroma_persistence")
    os.makedirs(chroma_dir, exist_ok=True)

    from backend.app.config import settings
    settings.CHROMA_DIR = chroma_dir

    # Instance 1: Add chunks
    vs1 = VectorStoreService()
    vs1.chroma_path = chroma_dir

    chunks = [
        {
            "id": "doc1_0",
            "document_id": "doc1",
            "chunk_index": 0,
            "page_number": 1,
            "character_start": 0,
            "character_end": 50,
            "text_content": "The mitochondria is the powerhouse of the cell."
        },
        {
            "id": "doc1_1",
            "document_id": "doc1",
            "chunk_index": 1,
            "page_number": 2,
            "character_start": 51,
            "character_end": 100,
            "text_content": "Cellular respiration produces ATP molecules."
        }
    ]
    # Unit vectors
    emb1 = [0.5] * 768
    emb2 = [0.1] * 768

    vs1.add_chunks(
        chunks=chunks,
        embeddings=[emb1, emb2],
        workspace_id="ws_bio",
        document_id="doc1",
        filename="biology.pdf"
    )

    # Instance 2: Re-open persistent client from disk (simulating backend restart)
    vs2 = VectorStoreService()
    vs2.chroma_path = chroma_dir

    # Query with vector close to emb1
    query_vector = [0.49] * 768
    results = vs2.query_similar(
        query_vector=query_vector,
        workspace_id="ws_bio",
        document_ids=["doc1"],
        top_k=2
    )

    assert len(results) == 2
    assert results[0]["chunk_id"] == "doc1_0"
    assert results[0]["page_number"] == 1
    assert results[0]["filename"] == "biology.pdf"
    assert "powerhouse" in results[0]["text_content"]
