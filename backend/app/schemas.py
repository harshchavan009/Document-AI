from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


# System & Config Schemas
class ConfigResponse(BaseModel):
    allowed_extensions: List[str]
    allowed_mime_types: List[str]
    max_file_size_bytes: int
    max_file_size_mb: int
    default_chunk_size: int
    default_chunk_overlap: int
    default_top_k: int
    relevance_threshold: float
    embedding_model: str
    generation_model: str


class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    vector_store: str
    timestamp: datetime


# Workspace Schemas
class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    description: Optional[str] = Field(default=None, max_length=1000)


class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: Optional[str] = None
    document_count: int = 0
    created_at: datetime
    updated_at: datetime


class WorkspaceListResponse(BaseModel):
    workspaces: List[WorkspaceResponse]


# Document Schemas
class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    filename: str
    file_type: str
    file_size: int
    page_count: int
    chunk_count: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int


class DocumentStatusResponse(BaseModel):
    id: str
    status: str
    page_count: int
    chunk_count: int
    error_message: Optional[str] = None


class DocumentUploadItem(BaseModel):
    id: str
    filename: str
    file_size: int
    file_type: str
    status: str
    created_at: datetime


class RejectedUploadItem(BaseModel):
    filename: str
    reason: str


class DocumentUploadResponse(BaseModel):
    uploaded: List[DocumentUploadItem]
    rejected: List[RejectedUploadItem]


# Chat and RAG Schemas
class QueryRequest(BaseModel):
    workspace_id: str
    session_id: Optional[str] = None
    document_ids: Optional[List[str]] = Field(default=None, description="Optional document IDs to scope search")
    question: str = Field(min_length=1, max_length=2000)
    top_k: Optional[int] = Field(default=5, ge=1, le=20)
    relevance_threshold: Optional[float] = Field(default=None, ge=0.0, le=2.0)


class CitationItem(BaseModel):
    citation_index: int
    document_id: str
    filename: str
    page_number: int
    chunk_id: Optional[str] = None
    excerpt: str
    relevance_score: Optional[float] = None


class RetrievalMetadata(BaseModel):
    retrieved_chunks_count: int
    standalone_query: str


class QueryResponse(BaseModel):
    success: bool
    session_id: str
    answer: str
    sources: List[CitationItem]
    retrieval_metadata: RetrievalMetadata


class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: str
    content: str
    retrieval_query: Optional[str] = None
    created_at: datetime
    citations: List[CitationItem] = []


class ChatSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    title: str
    created_at: datetime
    updated_at: datetime


class ChatSessionDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse]



class SuggestedQuestionsRequest(BaseModel):
    workspace_id: str
    document_ids: Optional[List[str]] = None


class SuggestedQuestionsResponse(BaseModel):
    questions: List[str]
