import os
import tempfile
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.main import app
from backend.app.database import Base, get_db
from backend.app.models import Workspace
from backend.app.config import settings

# Temporary directory for test ChromaDB and uploads
TEST_TEMP_DIR = tempfile.mkdtemp(prefix="documind_test_")
TEST_STORAGE = os.path.join(TEST_TEMP_DIR, "storage")
TEST_UPLOADS = os.path.join(TEST_TEMP_DIR, "uploads")
TEST_CHROMA = os.path.join(TEST_TEMP_DIR, "chroma")

os.makedirs(TEST_STORAGE, exist_ok=True)
os.makedirs(TEST_UPLOADS, exist_ok=True)
os.makedirs(TEST_CHROMA, exist_ok=True)

settings.STORAGE_DIR = TEST_STORAGE
settings.UPLOADS_DIR = TEST_UPLOADS
settings.CHROMA_DIR = TEST_CHROMA

TEST_DB_URL = f"sqlite:///{os.path.join(TEST_STORAGE, 'test.db')}"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Patch SessionLocal across backend modules for test database consistency
import backend.app.database
import backend.app.services.job_service
import backend.app.api.chat

backend.app.database.SessionLocal = TestingSessionLocal
backend.app.services.job_service.SessionLocal = TestingSessionLocal
backend.app.api.chat.SessionLocal = TestingSessionLocal


@pytest.fixture(scope="session", autouse=True)
def init_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_workspace(db_session):
    ws = Workspace(
        session_id="test_session_id_12345",
        name="Unit Test Workspace",
        description="Workspace for running automated tests"
    )
    db_session.add(ws)
    db_session.commit()
    db_session.refresh(ws)
    return ws


@pytest.fixture
def generate_sample_pdf():
    """Generates a genuine multi-page test PDF file using PyMuPDF."""
    try:
        import pymupdf as fitz
    except ImportError:
        import fitz

    def _create_pdf(filepath: str, pages_content: list):
        doc = fitz.open()
        for text in pages_content:
            page = doc.new_page()
            page.insert_text((50, 72), text)
        doc.save(filepath)
        doc.close()
        return filepath

    return _create_pdf
