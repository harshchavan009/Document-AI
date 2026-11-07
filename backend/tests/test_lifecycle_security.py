import io
import os
from backend.app.models import Document, Workspace
from backend.app.services.document_service import DocumentService


def test_document_deletion_removes_file_and_metadata(client, sample_workspace, db_session, tmp_path):
    """
    Verifies that deleting a document removes the disk file, metadata, and database record.
    """
    # 1. Create a dummy file on disk
    dummy_file = str(tmp_path / "delete_me.txt")
    with open(dummy_file, "w") as f:
        f.write("Temporary content to delete.")

    doc = Document(
        workspace_id=sample_workspace.id,
        filename="delete_me.txt",
        storage_path=dummy_file,
        file_type="text/plain",
        file_size=28,
        file_hash="dummy_hash_12345",
        status="Ready"
    )
    db_session.add(doc)
    db_session.commit()
    db_session.refresh(doc)

    doc_id = doc.id
    assert os.path.exists(dummy_file)

    # 2. Call DELETE endpoint
    response = client.delete(f"/api/documents/{doc_id}")
    assert response.status_code == 200
    assert response.json()["success"] is True

    # 3. Verify physical file is gone
    assert not os.path.exists(dummy_file)

    # 4. Verify database record is gone
    db_doc = db_session.query(Document).filter(Document.id == doc_id).first()
    assert db_doc is None


def test_cross_session_workspace_isolation(client, db_session):
    """
    Verifies that a visitor session cannot access or delete workspaces
    belonging to another visitor session.
    """
    # Create workspace owned by user A
    ws_user_a = Workspace(
        session_id="session_user_a_abcdef123456",
        name="User A Confidential Workspace",
        description="Private data"
    )
    db_session.add(ws_user_a)
    db_session.commit()
    db_session.refresh(ws_user_a)

    # Client visits with session token for user B
    client.cookies.set("dm_session", "session_user_b_987654321000")

    # User B attempts to access User A's workspace
    get_resp = client.get(f"/api/workspaces/{ws_user_a.id}")
    assert get_resp.status_code == 404
    assert get_resp.json()["detail"] == "Workspace not found"

    # User B attempts to delete User A's workspace
    del_resp = client.delete(f"/api/workspaces/{ws_user_a.id}")
    assert del_resp.status_code == 404
    assert del_resp.json()["detail"] == "Workspace not found"


def test_api_config_endpoint_returns_dynamic_configuration(client):
    """
    Verifies that GET /api/config returns all runtime configuration values
    with no hardcoded values in client components.
    """
    response = client.get("/api/config")
    assert response.status_code == 200
    data = response.json()
    assert ".pdf" in data["allowed_extensions"]
    assert ".txt" in data["allowed_extensions"]
    assert data["max_file_size_mb"] > 0
    assert data["max_file_size_bytes"] > 0
    assert data["max_pdf_pages"] == 50
    assert data["data_retention_days"] == 7
    assert data["default_chunk_size"] == 600
    assert data["default_chunk_overlap"] == 100
    assert data["default_top_k"] == 5
    assert data["relevance_threshold"] == 0.65
    assert data["embedding_model"] == "gemini-embedding-001"
    assert data["generation_model"] == "gemini-2.5-flash"

