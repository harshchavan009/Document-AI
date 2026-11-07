import logging
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Feedback
from backend.app.schemas import FeedbackCreate, FeedbackResponse
from backend.app.utils.security import get_or_create_session_id
from backend.app.utils.limiter import limiter

router = APIRouter(prefix="/feedback", tags=["Feedback"])
logger = logging.getLogger(__name__)


@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def submit_feedback(
    request: Request,
    payload: FeedbackCreate,
    db: Session = Depends(get_db)
):
    """
    Submits user feedback, bug reports, or feature requests.
    Stores entries in the database associated with the active session token.
    """
    session_id = get_or_create_session_id(request)

    fb = Feedback(
        session_id=session_id,
        category=payload.category.strip().lower()[:32],
        comment=payload.comment.strip(),
        rating=payload.rating
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)

    logger.info(f"Feedback submitted: category={fb.category}, id={fb.id}")

    return FeedbackResponse(
        success=True,
        message="Thank you for your feedback. Your submission helps improve DocuMind AI.",
        id=fb.id
    )
