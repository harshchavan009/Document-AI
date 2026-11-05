import hashlib
import os
import uuid
from typing import Tuple


def compute_sha256(file_bytes: bytes) -> str:
    """Computes SHA-256 hash of file content for exact duplicate detection."""
    return hashlib.sha256(file_bytes).hexdigest()


def verify_magic_bytes(file_bytes: bytes, filename: str) -> Tuple[bool, str, str]:
    """
    Verifies file magic bytes and returns (is_valid, mime_type, error_reason).
    Never trusts client MIME or extension alone.
    """
    ext = os.path.splitext(filename.lower())[1]

    if ext == ".pdf":
        if file_bytes.startswith(b"%PDF-"):
            return True, "application/pdf", ""
        return False, "", "File has .pdf extension but lacks valid PDF magic bytes header"

    if ext == ".txt":
        # Check for null bytes which indicate binary/executable payload
        if b"\x00" in file_bytes[:1024]:
            return False, "", "File has .txt extension but contains binary content"
        try:
            file_bytes.decode("utf-8")
            return True, "text/plain", ""
        except UnicodeDecodeError:
            try:
                file_bytes.decode("latin-1")
                return True, "text/plain", ""
            except Exception:
                return False, "", "File has .txt extension but could not be decoded as text"

    return False, "", f"Unsupported file extension: {ext}"


def generate_storage_path(base_dir: str, extension: str) -> Tuple[str, str]:
    """Generates a non-deterministic safe filesystem path using UUID."""
    file_id = str(uuid.uuid4())
    safe_name = f"{file_id}{extension}"
    full_path = os.path.join(base_dir, safe_name)
    return file_id, full_path


def format_file_size(size_bytes: int) -> str:
    """Formats file size into human-readable string."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes / (1024 * 1024):.1f} MB"

