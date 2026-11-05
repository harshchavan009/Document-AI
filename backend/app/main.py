import time
import uuid
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.api import (
    health,
    config as config_api,
    workspaces,
    documents,
    chat
)
from backend.app.utils.security import (
    SESSION_COOKIE_NAME,
    generate_session_token
)

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("documind")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database schema and storage directories on startup."""
    logger.info("Initializing DocuMind AI database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")
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


@app.middleware("http")
async def security_and_session_middleware(request: Request, call_next):
    """
    Enforces security headers and guarantees a cryptographic visitor session token.
    All workspace and document lookups are scoped by this identity.
    """
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()

    # Session token check
    existing_session = request.cookies.get(SESSION_COOKIE_NAME)
    is_new_session = False
    session_id = existing_session

    if not session_id or len(session_id) < 16:
        session_id = generate_session_token()
        is_new_session = True

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


@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/api/docs"
    }

