from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.schemas import HealthResponse
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

