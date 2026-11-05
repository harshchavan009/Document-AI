import os
import pytest
from backend.app.config import settings
from backend.app.services.job_service import JobService
from backend.app.models import Document, Workspace
from backend.app.services.document_service import DocumentService


def test_end_to_end_ingestion_pipeline_stages(client, sample_workspace, db_session, generate_sample_pdf, tmp_path):
    """
    Executes end-to-end document ingestion through real stages:
    Validates magic bytes, extracts text with PyMuPDF, chunks sentences,
    and records accurate page and chunk counts in SQLite.
    """
    pdf_path = str(tmp_path / "integration_study.pdf")
    page1 = (
        "Phase 1 oncology trial conducted across four clinical centers. "
        "Standard dose escalation protocol was followed."
    )
    page2 = (
        "Phase 2 expanded cohort to 450 subjects. "
        "Therapeutic efficacy reached 78.4 percent with minimal adverse reactions."
    )
    generate_sample_pdf(pdf_path, [page1, page2])

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    # 1. Upload via REST API
    files = [("files", ("integration_study.pdf", pdf_bytes, "application/pdf"))]
    upload_resp = client.post(
        "/api/documents/upload",
        data={"workspace_id": sample_workspace.id},
        files=files
    )
    assert upload_resp.status_code == 202
    doc_id = upload_resp.json()["uploaded"][0]["id"]

    # 2. Run JobService processing synchronously to inspect all pipeline stages
    JobService.process_document(doc_id)

    # 3. Inspect document state in database
    doc = db_session.query(Document).filter(Document.id == doc_id).first()
    assert doc is not None
    assert doc.page_count == 2
    assert doc.chunk_count >= 2

    # 4. Check if Gemini API key was configured
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
        assert doc.status == "Ready"
    else:
        # Transparently reports missing key
        assert doc.status == "Failed"
        assert "Gemini API key is not configured" in doc.error_message

    # 5. Clean up document
    client.delete(f"/api/documents/{doc_id}")
    assert db_session.query(Document).filter(Document.id == doc_id).first() is None

