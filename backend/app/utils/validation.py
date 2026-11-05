import os
from typing import Tuple
from backend.app.config import settings


def validate_file_metadata(filename: str, file_size: int) -> Tuple[bool, str]:
    """Validates basic file metadata against configured restrictions."""
    ext = os.path.splitext(filename.lower())[1]
    if ext not in settings.ALLOWED_EXTENSIONS:
        allowed = ", ".join(settings.ALLOWED_EXTENSIONS)
        return False, f"Unsupported file type '{ext}'. Allowed types: {allowed}"

    if file_size > settings.max_file_size_bytes:
        max_mb = settings.MAX_FILE_SIZE_MB
        return False, f"File size exceeds maximum permitted limit of {max_mb} MB"

    if file_size == 0:
        return False, "File is empty (0 bytes)"

    return True, ""

