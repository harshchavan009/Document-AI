import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Google Gemini API
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API Key")

    # Application Settings
    APP_NAME: str = "DocuMind AI"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    SECRET_KEY: str = "documind-secure-session-secret-key-2026"

    # CORS Configuration
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Storage Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    STORAGE_DIR: str = Field(default="./storage")
    UPLOADS_DIR: str = Field(default="./storage/uploads")
    CHROMA_DIR: str = Field(default="./storage/chroma")
    DATABASE_URL: str = Field(default="sqlite:///./storage/documind.db")

    # Document Ingestion and Chunking
    DEFAULT_CHUNK_SIZE: int = 600
    DEFAULT_CHUNK_OVERLAP: int = 100
    MAX_FILE_SIZE_MB: int = 20
    MAX_PDF_PAGES: int = 50
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".txt"]
    ALLOWED_MIME_TYPES: List[str] = ["application/pdf", "text/plain"]

    # Abuse and Cost Protection Rate Limits
    RATE_LIMIT_ENABLED: bool = True
    UPLOAD_RATE_LIMIT: str = "20/minute"
    SAMPLE_RATE_LIMIT: str = "10/minute"
    QUERY_RATE_LIMIT: str = "30/minute"

    # Data Lifecycle and Retention
    DATA_RETENTION_DAYS: int = 7

    # Retrieval and AI Generation
    DEFAULT_TOP_K: int = 5
    RELEVANCE_THRESHOLD: float = 0.65
    EMBEDDING_MODEL: str = "gemini-embedding-001"
    EMBEDDING_DIMENSIONS: int = 768
    GENERATION_MODEL: str = "gemini-2.5-flash"

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024


settings = Settings()

# Ensure required storage directories exist
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
os.makedirs(settings.CHROMA_DIR, exist_ok=True)

