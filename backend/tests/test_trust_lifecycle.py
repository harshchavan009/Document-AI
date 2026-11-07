import io
import os
import json
import zipfile
from datetime import datetime, timezone, timedelta
import pytest
from backend.app.models import Workspace, Document, ChatSession, ChatMessage, MessageCitation, Feedback
from backend.app.services.retention_service import RetentionService


def test_purge_session_removes_all_user_data(client, db_session, tmp_path):
    """
    Verifies that DELETE /api/workspaces/purge-session removes all workspaces,
    documents, disk files, and chat sessions for the active session token.
    """
    session_id = "purge_test_session_token_111222"
    client.cookies.set("dm_session", session_id)

    # 1. Create workspace
    ws = Workspace(
        session_id=session_id,
        name="Purge Target Workspace",
        description="To be destroyed"
    )
    db_session.add(ws)
    db_session.commit()
    db_session.refresh(ws)

    # 2. Create disk file and Document
    file_path = str(tmp_path / "purge_doc.txt")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("Secret research data that must be purged.")

    doc = Document(
        workspace_id=ws.id,
        filename="purge_doc.txt",
        storage_path=file_path,
        file_type="text/plain",
        file_size=42,
        file_hash="hash_purge_123",
        status="Ready"
    )
    db_session.add(doc)
    db_session.commit()
    db_session.refresh(doc)
    assert os.path.exists(file_path)

    # 3. Create chat session
    cs = ChatSession(
        workspace_id=ws.id,
        title="Purge Chat"
    )
    db_session.add(cs)
    db_session.commit()

    # 4. Execute purge
    response = client.delete("/api/workspaces/purge-session")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "new_session_id" in data

    # 5. Verify physical file on disk is removed
    assert not os.path.exists(file_path)

    # 6. Verify SQLite records are purged
    assert db_session.query(Workspace).filter(Workspace.id == ws.id).first() is None
    assert db_session.query(Document).filter(Document.id == doc.id).first() is None
    assert db_session.query(ChatSession).filter(ChatSession.id == cs.id).first() is None


def test_export_session_generates_valid_zip_archive(client, db_session, tmp_path):
    """
    Verifies that GET /api/workspaces/export-session generates a valid .zip
    archive containing raw documents, chat logs, and manifest.json.
    """
    session_id = "export_test_session_token_333444"
    client.cookies.set("dm_session", session_id)

    ws = Workspace(
        session_id=session_id,
        name="Export Workspace",
        description="Data to export"
    )
    db_session.add(ws)
    db_session.commit()
    db_session.refresh(ws)

    file_path = str(tmp_path / "exported_notes.txt")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("Research findings on clinical biomarkers.")

    doc = Document(
        workspace_id=ws.id,
        filename="exported_notes.txt",
        storage_path=file_path,
        file_type="text/plain",
        file_size=39,
        file_hash="hash_export_123",
        page_count=1,
        chunk_count=1,
        status="Ready"
    )
    db_session.add(doc)
    db_session.commit()

    cs = ChatSession(workspace_id=ws.id, title="Biomarker Analysis")
    db_session.add(cs)
    db_session.commit()
    db_session.refresh(cs)

    msg = ChatMessage(
        session_id=cs.id,
        role="user",
        content="What biomarkers were found?"
    )
    db_session.add(msg)
    db_session.commit()

    # Call export endpoint
    response = client.get("/api/workspaces/export-session")
    assert response.status_code == 200
    assert "application/zip" in response.headers["content-type"]
    assert "attachment" in response.headers["content-disposition"]

    # Inspect zip contents
    zip_buffer = io.BytesIO(response.content)
    with zipfile.ZipFile(zip_buffer, "r") as archive:
        namelist = archive.namelist()
        assert "manifest.json" in namelist
        assert f"documents/{ws.name}/exported_notes.txt" in namelist

        # Validate manifest
        manifest_raw = archive.read("manifest.json").decode("utf-8")
        manifest = json.loads(manifest_raw)
        assert manifest["workspaces_count"] == 1
        assert manifest["documents_count"] == 1
        assert manifest["conversations_count"] == 1

        # Validate archived file content
        archived_text = archive.read(f"documents/{ws.name}/exported_notes.txt").decode("utf-8")
        assert "Research findings on clinical biomarkers." in archived_text


def test_retention_reaper_purges_only_expired_workspaces(db_session, tmp_path):
    """
    Verifies that RetentionService.purge_expired_workspaces removes only workspaces
    whose updated_at exceeds the retention threshold.
    """
    now = datetime.now(timezone.utc)

    # 1. Stale workspace (10 days old)
    ws_stale = Workspace(
        session_id="stale_session_1",
        name="Stale Workspace",
        description="Older than 7 days"
    )
    ws_stale.updated_at = now - timedelta(days=10)
    db_session.add(ws_stale)

    # 2. Fresh workspace (2 days old)
    ws_fresh = Workspace(
        session_id="fresh_session_2",
        name="Fresh Workspace",
        description="Active recently"
    )
    ws_fresh.updated_at = now - timedelta(days=2)
    db_session.add(ws_fresh)
    db_session.commit()

    # 3. Add document to stale workspace
    stale_file = str(tmp_path / "stale_file.txt")
    with open(stale_file, "w") as f:
        f.write("Stale content.")

    doc_stale = Document(
        workspace_id=ws_stale.id,
        filename="stale_file.txt",
        storage_path=stale_file,
        file_type="text/plain",
        file_size=14,
        file_hash="hash_stale_1",
        status="Ready"
    )
    db_session.add(doc_stale)
    db_session.commit()
    assert os.path.exists(stale_file)

    # Run retention purge for 7 days
    purged_count = RetentionService.purge_expired_workspaces(db_session, retention_days=7)
    assert purged_count == 1

    # Stale workspace and file must be gone
    assert not os.path.exists(stale_file)
    assert db_session.query(Workspace).filter(Workspace.id == ws_stale.id).first() is None
    assert db_session.query(Document).filter(Document.id == doc_stale.id).first() is None

    # Fresh workspace must remain intact
    assert db_session.query(Workspace).filter(Workspace.id == ws_fresh.id).first() is not None


def test_feedback_submission_endpoint(client, db_session):
    """
    Verifies that POST /api/feedback saves user bug reports and ratings to the database.
    """
    session_id = "feedback_user_session_999"
    client.cookies.set("dm_session", session_id)

    payload = {
        "category": "bug",
        "comment": "The citation drawer font size is slightly small on tablet width.",
        "rating": 4
    }

    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "id" in data

    # Verify record in database
    fb_record = db_session.query(Feedback).filter(Feedback.id == data["id"]).first()
    assert fb_record is not None
    assert fb_record.category == "bug"
    assert fb_record.comment == payload["comment"]
    assert fb_record.rating == 4
    assert fb_record.session_id == session_id

    # Test short comment rejection (min 3 chars)
    invalid_resp = client.post("/api/feedback", json={"category": "general", "comment": "hi"})
    assert invalid_resp.status_code == 422
