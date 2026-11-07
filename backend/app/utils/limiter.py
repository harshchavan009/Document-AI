import logging
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from backend.app.config import settings

logger = logging.getLogger(__name__)


def get_rate_limit_key(request: Request) -> str:
    """
    Derives rate limit identifier from visitor session token, falling back to remote IP.
    """
    session_id = getattr(request.state, "session_id", None)
    if not session_id:
        session_id = request.cookies.get("dm_session") or request.headers.get("X-Session-ID")
    if session_id:
        return f"sess:{session_id}"
    return get_remote_address(request) or "127.0.0.1"


limiter = Limiter(
    key_func=get_rate_limit_key,
    enabled=settings.RATE_LIMIT_ENABLED,
    storage_uri="memory://"
)

