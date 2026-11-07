import shutil
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.schemas import HealthResponse, ReadinessResponse
from backend.app.database import get_db
from backend.app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def get_health(db: Session = Depends(get_db)):
    """Verifies service health, database connection, and vector store readiness."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    vector_status = "ready"
    try:
        from backend.app.services.vector_store import VectorStoreService
        vs = VectorStoreService()
        vs.get_collection()
    except Exception as e:
        vector_status = f"unavailable: {str(e)}"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        version=settings.APP_VERSION,
        database=db_status,
        vector_store=vector_status,
        timestamp=datetime.now(timezone.utc)
    )


@router.get("/ready", response_model=ReadinessResponse)
def get_readiness(response: Response, db: Session = Depends(get_db)):
    """
    Comprehensive readiness probe for container orchestrators (Kubernetes, Docker Swarm, Railway).
    Validates database, vector store, available disk storage, and Gemini API key readiness.
    Returns HTTP 200 if ready for traffic, or HTTP 503 if critical dependencies fail.
    """
    # 1. Database read/write check
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    # 2. ChromaDB vector store check
    vector_status = "ready"
    try:
        from backend.app.services.vector_store import VectorStoreService
        vs = VectorStoreService()
        vs.get_collection()
    except Exception as e:
        vector_status = f"unavailable: {str(e)}"

    # 3. Storage disk space check
    try:
        usage = shutil.disk_usage(settings.STORAGE_DIR)
        free_mb = int(usage.free / (1024 * 1024))
    except Exception:
        free_mb = 0

    # 4. Gemini API key status
    gemini_configured = bool(
        settings.GEMINI_API_KEY and
        settings.GEMINI_API_KEY.strip() and
        settings.GEMINI_API_KEY != "your_gemini_api_key_here"
    )

    is_ready = (db_status == "connected" and vector_status == "ready" and free_mb >= 50)

    if not is_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return ReadinessResponse(
        ready=is_ready,
        version=settings.APP_VERSION,
        database=db_status,
        vector_store=vector_status,
        storage_free_mb=free_mb,
        gemini_configured=gemini_configured,
        timestamp=datetime.now(timezone.utc)
    )

