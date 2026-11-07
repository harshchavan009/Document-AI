import io
import os
import pytest
from backend.app.models import Workspace, Document, ChatSession, ChatMessage
from backend.app.services.extraction_service import ExtractionService, ExtractionError
from backend.app.config import settings


@pytest.fixture
def user_a_data(db_session, tmp_path):
    """Creates a workspace, document, and chat session owned by User A."""
    ws = Workspace(
        session_id="session_user_a_secure_token_111",
        name="User A Private Workspace",
        description="Confidential clinical trials"
    )
    db_session.add(ws)
    db_session.commit()
    db_session.refresh(ws)

    # Disk file for document
    file_path = str(tmp_path / "private_protocol.txt")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("User A private trial protocol content.")

    doc = Document(
        workspace_id=ws.id,
        filename="private_protocol.txt",
        storage_path=file_path,
        file_type="text/plain",
        file_size=38,
        file_hash="hash_user_a_priv_111",
        page_count=1,
        chunk_count=1,
        status="Ready"
    )
    db_session.add(doc)
    db_session.commit()
    db_session.refresh(doc)

    cs = ChatSession(
        workspace_id=ws.id,
        title="User A Analysis"
    )
    db_session.add(cs)
    db_session.commit()
    db_session.refresh(cs)

    msg = ChatMessage(
        session_id=cs.id,
        role="user",
        content="Summarize dosage"
    )
    db_session.add(msg)
    db_session.commit()

    return {
        "session_id": "session_user_a_secure_token_111",
        "workspace": ws,
        "document": doc,
        "chat_session": cs,
        "file_path": file_path
    }


def test_cross_tenant_document_listing_blocked(client, user_a_data):
    """User B cannot list User A workspace documents."""
    client.cookies.set("dm_session", "session_user_b_attacker_222")
    ws_id = user_a_data["workspace"].id

    res = client.get(f"/api/documents?workspace_id={ws_id}")
    assert res.status_code == 404
    assert res.json()["detail"] == "Workspace not found"


def test_cross_tenant_document_upload_blocked(client, user_a_data):
    """User B cannot upload documents into User A workspace."""
    client.cookies.set("dm_session", "session_user_b_attacker_222")
    ws_id = user_a_data["workspace"].id

    files = [("files", ("exploit.txt", io.BytesIO(b"malicious payload"), "text/plain"))]
    res = client.post("/api/documents/upload", data={"workspace_id": ws_id}, files=files)
    assert res.status_code == 404
    assert res.json()["detail"] == "Workspace not found"


def test_cross_tenant_sample_ingest_blocked(client, user_a_data):
    """User B cannot trigger sample document ingestion in User A workspace."""
    client.cookies.set("dm_session", "session_user_b_attacker_222")
    ws_id = user_a_data["workspace"].id

    res = client.post("/api/documents/sample", data={"workspace_id": ws_id})
    assert res.status_code == 404
    assert res.json()["detail"] == "Workspace not found"


def test_cross_tenant_document_access_blocked(client, user_a_data):
    """User B cannot view document details or polling status by ID."""
    client.cookies.set("dm_session", "session_user_b_attacker_222")
    doc_id = user_a_data["document"].id

    res_meta = client.get(f"/api/documents/{doc_id}")
    assert res_meta.status_code == 404
    assert res_meta.json()["detail"] == "Document not found"

    res_status = client.get(f"/api/documents/{doc_id}/status")
    assert res_status.status_code == 404
    assert res_status.json()["detail"] == "Document not found"


def test_cross_tenant_document_file_download_blocked(client, user_a_data):
    """User B cannot download raw document files belonging to User A."""
    client.cookies.set("dm_session", "session_user_b_attacker_222")
    doc_id = user_a_data["document"].id

    res = client.get(f"/api/documents/{doc_id}/file")
    assert res.status_code == 404
    assert res.json()["detail"] == "Document not found"


def test_cross_tenant_document_reprocess_blocked(client, user_a_data):
    """User B cannot trigger reprocess for User A document."""
    client.cookies.set("dm_session", "session_user_b_attacker_222")
    doc_id = user_a_data["document"].id

    res = client.post(f"/api/documents/{doc_id}/reprocess")
    assert res.status_code == 404
    assert res.json()["detail"] == "Document not found"


def test_cross_tenant_document_deletion_blocked(client, user_a_data, db_session):
    """User B cannot delete User A document; file and record remain intact."""
    client.cookies.set("dm_session", "session_user_b_attacker_222")
    doc_id = user_a_data["document"].id
    file_path = user_a_data["file_path"]

    res = client.delete(f"/api/documents/{doc_id}")
    assert res.status_code == 404
    assert res.json()["detail"] == "Document not found"

    # Verify physical file and database row were preserved
    assert os.path.exists(file_path)
    assert db_session.query(Document).filter(Document.id == doc_id).first() is not None


def test_cross_tenant_chat_sessions_blocked(client, user_a_data):
    """User B cannot list, read, or delete User A chat sessions."""
    client.cookies.set("dm_session", "session_user_b_attacker_222")
    ws_id = user_a_data["workspace"].id
    cs_id = user_a_data["chat_session"].id

    # List sessions for workspace
    res_list = client.get(f"/api/chat/sessions?workspace_id={ws_id}")
    assert res_list.status_code == 404
    assert res_list.json()["detail"] == "Workspace not found"

    # Read session detail
    res_get = client.get(f"/api/chat/sessions/{cs_id}")
    assert res_get.status_code == 404
    assert res_get.json()["detail"] == "Chat session not found"

    # Delete session
    res_del = client.delete(f"/api/chat/sessions/{cs_id}")
    assert res_del.status_code == 404
    assert res_del.json()["detail"] == "Chat session not found"


def test_cross_tenant_chat_query_and_suggestions_blocked(client, user_a_data):
    """User B cannot query RAG or request suggested questions in User A workspace."""
    client.cookies.set("dm_session", "session_user_b_attacker_222")
    ws_id = user_a_data["workspace"].id

    res_q = client.post("/api/chat/query", json={
        "workspace_id": ws_id,
        "question": "What is the secret trial data?"
    })
    assert res_q.status_code == 404
    assert res_q.json()["detail"] == "Workspace not found"

    res_sugg = client.post("/api/chat/suggested-questions", json={
        "workspace_id": ws_id
    })
    assert res_sugg.status_code == 404
    assert res_sugg.json()["detail"] == "Workspace not found"


def test_max_pdf_page_limit_enforcement(client, sample_workspace, generate_sample_pdf, tmp_path):
    """Rejects PDFs that exceed MAX_PDF_PAGES (50 pages)."""
    pdf_path = str(tmp_path / "oversized.pdf")
    # Generate 51 pages
    pages = [f"Page {i}: Some research content here." for i in range(1, 52)]
    generate_sample_pdf(pdf_path, pages)

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    # 1. Direct ExtractionService rejection
    with pytest.raises(ExtractionError) as exc_info:
        ExtractionService.extract_pdf(pdf_path)
    assert "exceeds the maximum limit of 50 pages" in str(exc_info.value)

    # 2. REST API upload rejection upfront
    files = [("files", ("oversized.pdf", io.BytesIO(pdf_bytes), "application/pdf"))]
    response = client.post(
        "/api/documents/upload",
        data={"workspace_id": sample_workspace.id},
        files=files
    )
    assert response.status_code == 202
    data = response.json()
    assert len(data["uploaded"]) == 0
    assert len(data["rejected"]) == 1
    assert "50 pages" in data["rejected"][0]["reason"]

