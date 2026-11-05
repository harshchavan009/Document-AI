from fastapi import APIRouter
from backend.app.schemas import ConfigResponse
from backend.app.config import settings

router = APIRouter(tags=["Config"])


@router.get("/config", response_model=ConfigResponse)
def get_public_config():
    """
    Exposes public runtime configurations so the frontend never hardcodes
    upload limits, accepted MIME types, or model identifiers.
    """
    return ConfigResponse(
        allowed_extensions=settings.ALLOWED_EXTENSIONS,
        allowed_mime_types=settings.ALLOWED_MIME_TYPES,
        max_file_size_bytes=settings.max_file_size_bytes,
        max_file_size_mb=settings.MAX_FILE_SIZE_MB,
        default_chunk_size=settings.DEFAULT_CHUNK_SIZE,
        default_chunk_overlap=settings.DEFAULT_CHUNK_OVERLAP,
        default_top_k=settings.DEFAULT_TOP_K,
        relevance_threshold=settings.RELEVANCE_THRESHOLD,
        embedding_model=settings.EMBEDDING_MODEL,
        generation_model=settings.GENERATION_MODEL
    )

