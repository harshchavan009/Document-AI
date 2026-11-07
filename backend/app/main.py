import os
import time
import uuid
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.api import (
    health,
    config as config_api,
    workspaces,
    documents,
    chat,
    feedback
)
from backend.app.utils.security import (
    SESSION_COOKIE_NAME,
    generate_session_token
)
from slowapi.errors import RateLimitExceeded
from backend.app.utils.limiter import limiter
from backend.app.services.job_service import JobService
from backend.app.services.retention_service import RetentionService

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("documind")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database schema, storage directories, and recovers orphan jobs on startup."""
    logger.info("Initializing DocuMind AI database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")

    # Recover any ingestion jobs interrupted by previous server restart
    recovered_count = JobService.recover_orphan_jobs()
    if recovered_count > 0:
        logger.info(f"Startup recovery: reset {recovered_count} interrupted jobs to Failed state.")

    # Automated data retention reaper for stale guest workspaces
    try:
        purged_workspaces = RetentionService.purge_expired_workspaces()
        if purged_workspaces > 0:
            logger.info(f"Startup retention: purged {purged_workspaces} expired workspaces.")
    except Exception as e:
        logger.warning(f"Startup retention purge error: {e}")

    yield
    logger.info("DocuMind AI application shutting down cleanly.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-grade AI Document Intelligence Platform with Verifiable RAG Citations",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "detail": "Rate limit exceeded. Please wait a moment before sending more requests."
        }
    )


@app.middleware("http")
async def security_and_session_middleware(request: Request, call_next):
    """
    Enforces security headers and assigns a cryptographic visitor session token.
    All workspace and document lookups are scoped by this identity.
    """
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()

    # Session token check
    existing_session = request.cookies.get(SESSION_COOKIE_NAME) or request.headers.get("X-Session-ID")
    is_new_session = False
    session_id = existing_session

    if not session_id or len(session_id) < 16:
        session_id = generate_session_token()
        is_new_session = True

    request.state.session_id = session_id

    response: Response = await call_next(request)

    duration = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{duration:.3f}s"

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # Set session cookie if new or missing
    if is_new_session:
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=session_id,
            httponly=True,
            samesite="lax",
            secure=settings.APP_ENV == "production",
            max_age=60 * 60 * 24 * 30  # 30 days
        )

    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Centralized exception handler preventing stack trace leak in production."""
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}", exc_info=settings.DEBUG)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred while processing your request. Please try again."
            }
        }
    )


# Register API Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(config_api.router, prefix="/api")
app.include_router(workspaces.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")


frontend_dist = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
)

if os.path.exists(frontend_dist):
    from fastapi.staticfiles import StaticFiles
    from starlette.responses import FileResponse

    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="static-assets")

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API endpoint not found")
        target_file = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        index_file = os.path.join(frontend_dist, "index.html")
        return FileResponse(
            index_file,
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
else:
    @app.get("/")
    def root():
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "online",
            "docs": "/api/docs"
        }

