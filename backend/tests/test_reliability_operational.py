import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy import text
from backend.app.models import Document, Workspace
from backend.app.services.job_service import JobService
from backend.app.utils.circuit_breaker import (
    gemini_circuit_breaker,
    CircuitBreakerOpenException
)


def test_readiness_probe_success(client):
    """
    Verifies that GET /api/ready returns HTTP 200 with verified database,
    vector store, and storage space metrics.
    """
    response = client.get("/api/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["ready"] is True
    assert data["database"] == "connected"
    assert data["vector_store"] == "ready"
    assert data["storage_free_mb"] > 0
    assert "version" in data


def test_readiness_probe_database_failure(client, monkeypatch):
    """
    Verifies that GET /api/ready returns HTTP 503 if the database is unreachable.
    """
    from backend.app.api import health

    def broken_execute(*args, **kwargs):
        raise ConnectionError("Simulated database outage")

    # Mock db.execute inside get_readiness
    with patch("sqlalchemy.orm.Session.execute", side_effect=broken_execute):
        response = client.get("/api/ready")
        assert response.status_code == 503
        data = response.json()
        assert data["ready"] is False
        assert "unhealthy" in data["database"]


def test_orphan_job_recovery_unsticks_interrupted_documents(db_session, sample_workspace):
    """
    Verifies that JobService.recover_orphan_jobs resets pending jobs to Failed
    with clear recovery instructions.
    """
    # 1. Create interrupted documents
    doc_extracting = Document(
        workspace_id=sample_workspace.id,
        filename="interrupted_extract.pdf",
        storage_path="/tmp/fake1.pdf",
        file_type="application/pdf",
        file_size=1000,
        file_hash="hash_interrupted_1",
        status="Extracting"
    )
    doc_embedding = Document(
        workspace_id=sample_workspace.id,
        filename="interrupted_embed.pdf",
        storage_path="/tmp/fake2.pdf",
        file_type="application/pdf",
        file_size=2000,
        file_hash="hash_interrupted_2",
        status="Embedding"
    )
    doc_ready = Document(
        workspace_id=sample_workspace.id,
        filename="already_ready.pdf",
        storage_path="/tmp/fake3.pdf",
        file_type="application/pdf",
        file_size=3000,
        file_hash="hash_interrupted_3",
        status="Ready"
    )

    db_session.add_all([doc_extracting, doc_embedding, doc_ready])
    db_session.commit()

    # 2. Run orphan job recovery
    recovered_count = JobService.recover_orphan_jobs(db_session)
    assert recovered_count == 2

    # 3. Verify state transitions
    db_session.refresh(doc_extracting)
    db_session.refresh(doc_embedding)
    db_session.refresh(doc_ready)

    assert doc_extracting.status == "Failed"
    assert "interrupted by server restart" in doc_extracting.error_message

    assert doc_embedding.status == "Failed"
    assert "interrupted by server restart" in doc_embedding.error_message

    # Already completed documents must not be touched
    assert doc_ready.status == "Ready"
    assert doc_ready.error_message is None


def test_gemini_circuit_breaker_tripping_and_cooldown(client, sample_workspace):
    """
    Verifies that GeminiCircuitBreaker trips upon consecutive rate limit errors
    and blocks subsequent queries with HTTP 503 and Retry-After.
    """
    gemini_circuit_breaker.reset()
    assert gemini_circuit_breaker.is_open is False

    # Simulate 3 consecutive 429 quota exhaustion errors
    rate_limit_err = Exception("429 ResourceExhausted: Quota exceeded for model gemini-2.5-flash")
    gemini_circuit_breaker.record_failure(rate_limit_err)
    assert gemini_circuit_breaker.is_open is False

    gemini_circuit_breaker.record_failure(rate_limit_err)
    assert gemini_circuit_breaker.is_open is False

    # 3rd error trips breaker
    gemini_circuit_breaker.record_failure(rate_limit_err)
    assert gemini_circuit_breaker.is_open is True
    assert gemini_circuit_breaker.remaining_cooldown > 0

    # Outbound query must be rejected with 503 immediately
    with pytest.raises(CircuitBreakerOpenException) as exc_info:
        gemini_circuit_breaker.check_can_execute()
    assert "rate limit cooldown active" in str(exc_info.value)

    # API query test
    response = client.post("/api/chat/query", json={
        "workspace_id": sample_workspace.id,
        "question": "What is the study design?"
    })
    assert response.status_code == 503
    assert "rate limit cooldown active" in response.json()["detail"]
    assert "Retry-After" in response.headers

    # Reset breaker
    gemini_circuit_breaker.reset()
    assert gemini_circuit_breaker.is_open is False

