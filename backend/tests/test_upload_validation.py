import io
import os
import pytest
from backend.app.config import settings


def test_valid_txt_upload(client, sample_workspace):
    """Verifies that a genuine TXT file is accepted and queued for processing."""
    content = b"This is a genuine research document containing clinical trial notes."
    files = [("files", ("trial_notes.txt", io.BytesIO(content), "text/plain"))]
    data = {"workspace_id": sample_workspace.id}

    response = client.post("/api/documents/upload", data=data, files=files)
    assert response.status_code == 202
    res_json = response.json()
    assert len(res_json["uploaded"]) == 1
    assert res_json["uploaded"][0]["filename"] == "trial_notes.txt"
    assert res_json["uploaded"][0]["status"] == "Uploaded"
    assert len(res_json["rejected"]) == 0


def test_valid_pdf_upload(client, sample_workspace, generate_sample_pdf, tmp_path):
    """Verifies that a genuine PDF file with valid %PDF- magic bytes is accepted."""
    pdf_path = str(tmp_path / "valid_doc.pdf")
    generate_sample_pdf(pdf_path, ["Page 1: Introduction to AI.", "Page 2: RAG Methodologies."])

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    files = [("files", ("valid_doc.pdf", io.BytesIO(pdf_bytes), "application/pdf"))]
    data = {"workspace_id": sample_workspace.id}

    response = client.post("/api/documents/upload", data=data, files=files)
    assert response.status_code == 202
    res_json = response.json()
    assert len(res_json["uploaded"]) == 1
    assert res_json["uploaded"][0]["filename"] == "valid_doc.pdf"
    assert len(res_json["rejected"]) == 0


def test_invalid_extension_rejection(client, sample_workspace):
    """Rejects files with disallowed extensions (e.g., .exe, .py, .csv)."""
    files = [("files", ("script.py", io.BytesIO(b"print('hello')"), "text/x-python"))]
    data = {"workspace_id": sample_workspace.id}

    response = client.post("/api/documents/upload", data=data, files=files)
    assert response.status_code == 202
    res_json = response.json()
    assert len(res_json["uploaded"]) == 0
    assert len(res_json["rejected"]) == 1
    assert "Unsupported file type" in res_json["rejected"][0]["reason"]


def test_spoofed_mime_magic_byte_rejection(client, sample_workspace):
    """
    Rejects files claiming to be PDF in the extension and MIME header,
    but lacking the actual %PDF- magic bytes.
    """
    fake_pdf = b"This is plain text pretending to be a PDF file."
    files = [("files", ("spoofed.pdf", io.BytesIO(fake_pdf), "application/pdf"))]
    data = {"workspace_id": sample_workspace.id}

    response = client.post("/api/documents/upload", data=data, files=files)
    assert response.status_code == 202
    res_json = response.json()
    assert len(res_json["uploaded"]) == 0
    assert len(res_json["rejected"]) == 1
    assert "magic bytes" in res_json["rejected"][0]["reason"]


def test_binary_in_txt_rejection(client, sample_workspace):
    """Rejects files with .txt extension containing null bytes (binary executables)."""
    binary_content = b"Some text\x00\x01\x02\x03\x04"
    files = [("files", ("payload.txt", io.BytesIO(binary_content), "text/plain"))]
    data = {"workspace_id": sample_workspace.id}

    response = client.post("/api/documents/upload", data=data, files=files)
    assert response.status_code == 202
    res_json = response.json()
    assert len(res_json["rejected"]) == 1
    assert "binary content" in res_json["rejected"][0]["reason"]


def test_empty_file_rejection(client, sample_workspace):
    """Rejects empty (0-byte) files."""
    files = [("files", ("empty.txt", io.BytesIO(b""), "text/plain"))]
    data = {"workspace_id": sample_workspace.id}

    response = client.post("/api/documents/upload", data=data, files=files)
    assert response.status_code == 202
    res_json = response.json()
    assert len(res_json["rejected"]) == 1
    assert "empty" in res_json["rejected"][0]["reason"]


def test_oversized_file_rejection(client, sample_workspace, monkeypatch):
    """Rejects files that exceed the configured maximum file size."""
    # Temporarily set max size to 100 bytes for deterministic test
    monkeypatch.setattr(settings, "MAX_FILE_SIZE_MB", 0.0001)

    oversized = b"A" * 500
    files = [("files", ("huge.txt", io.BytesIO(oversized), "text/plain"))]
    data = {"workspace_id": sample_workspace.id}

    response = client.post("/api/documents/upload", data=data, files=files)
    assert response.status_code == 202
    res_json = response.json()
    assert len(res_json["rejected"]) == 1
    assert "exceeds maximum permitted limit" in res_json["rejected"][0]["reason"]



def test_ingest_sample_document(client, sample_workspace):
    """Verifies that the bundled sample document can be ingested via POST /api/documents/sample."""
    data = {"workspace_id": sample_workspace.id}
    response = client.post("/api/documents/sample", data=data)
    assert response.status_code == 201
    res_json = response.json()
    assert res_json["filename"] == "Attention_Is_All_You_Need.txt"
    assert res_json["status"] == "Uploaded"
    assert res_json["file_size"] > 0
