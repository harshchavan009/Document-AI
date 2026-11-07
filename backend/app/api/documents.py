import os
from typing import List, Optional
from fastapi import (
    APIRouter,
    Depends,
    Request,
    UploadFile,
    File,
    Form,
    BackgroundTasks,
    HTTPException,
    status
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Document
from backend.app.schemas import (
    DocumentResponse,
    DocumentListResponse,
    DocumentStatusResponse,
    DocumentUploadResponse
)
from backend.app.config import settings
from backend.app.utils.limiter import limiter
from backend.app.utils.security import (
    get_or_create_session_id,
    verify_workspace_access,
    verify_document_access
)
from backend.app.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED)
@limiter.limit(settings.UPLOAD_RATE_LIMIT)
async def upload_documents(
    request: Request,
    workspace_id: str = Form(...),
    files: List[UploadFile] = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db)
):
    """
    Accepts multiple PDF and TXT file uploads.
    Verifies workspace session ownership, performs extension, size, and magic-byte validation,
    saves files securely, and enqueues background text extraction and vector indexing.
    """
    session_id = get_or_create_session_id(request)
    verify_workspace_access(workspace_id, session_id, db)

    if not files or len(files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided in upload request."
        )

    uploaded, rejected = await DocumentService.upload_files(
        workspace_id=workspace_id,
        files=files,
        db=db,
        background_tasks=background_tasks
    )

    return DocumentUploadResponse(uploaded=uploaded, rejected=rejected)


@router.post("/sample", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.SAMPLE_RATE_LIMIT)
def ingest_sample_document(
    request: Request,
    workspace_id: str = Form(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db)
):
    """
    Ingests the bundled public-domain sample paper into the workspace.
    Verifies workspace session ownership, then enqueues real text extraction,
    sentence chunking, and ChromaDB vector indexing.
    """
    session_id = get_or_create_session_id(request)
    verify_workspace_access(workspace_id, session_id, db)

    doc = DocumentService.ingest_sample_document(
        workspace_id=workspace_id,
        db=db,
        background_tasks=background_tasks
    )
    return DocumentResponse.model_validate(doc)


@router.get("", response_model=DocumentListResponse)
def list_documents(
    request: Request,
    workspace_id: str,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Lists all documents in the specified workspace with live pipeline status,
    page counts, chunk counts, and file sizes. Strictly isolated to session.
    """
    session_id = get_or_create_session_id(request)
    workspace = verify_workspace_access(workspace_id, session_id, db)

    query = db.query(Document).filter(Document.workspace_id == workspace.id)

    if status_filter:
        query = query.filter(Document.status == status_filter)

    if search:
        query = query.filter(Document.filename.ilike(f"%{search.strip()}%"))

    docs = query.order_by(Document.created_at.desc()).all()
    total = len(docs)

    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(d) for d in docs],
        total=total
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Retrieves metadata and processing state for a single document owned by the session."""
    session_id = get_or_create_session_id(request)
    doc = verify_document_access(document_id, session_id, db)
    return DocumentResponse.model_validate(doc)


@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
def get_document_status(
    document_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Returns real-time processing status of a document for client polling.
    Driven entirely by actual database pipeline state and scoped by session.
    """
    session_id = get_or_create_session_id(request)
    doc = verify_document_access(document_id, session_id, db)
    return DocumentStatusResponse(
        id=doc.id,
        status=doc.status,
        page_count=doc.page_count,
        chunk_count=doc.chunk_count,
        error_message=doc.error_message
    )


@router.get("/{document_id}/file")
def get_document_file(
    document_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Serves the raw document file for in-browser PDF.js or TXT preview.
    Includes security headers to prevent sniffing and content execution.
    Strictly scoped to session owner.
    """
    session_id = get_or_create_session_id(request)
    doc = verify_document_access(document_id, session_id, db)

    if not doc.storage_path or not os.path.exists(doc.storage_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document binary file not found on disk"
        )

    headers = {
        "Content-Disposition": f"inline; filename=\"{doc.filename}\"",
        "X-Content-Type-Options": "nosniff"
    }

    return FileResponse(
        path=doc.storage_path,
        media_type=doc.file_type,
        headers=headers
    )


@router.post("/{document_id}/reprocess", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("10/minute")
def reprocess_document(
    document_id: str,
    request: Request,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db)
):
    """
    Triggers re-extraction, re-chunking, and re-indexing for a document.
    Strictly scoped to session owner.
    """
    session_id = get_or_create_session_id(request)
    doc = verify_document_access(document_id, session_id, db)
    reprocessed = DocumentService.reprocess_document(doc.id, db, background_tasks)
    return DocumentResponse.model_validate(reprocessed)


@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Permanently deletes a document, removing its disk file, database metadata,
    and all vector embeddings stored in ChromaDB. Strictly scoped to session owner.
    """
    session_id = get_or_create_session_id(request)
    doc = verify_document_access(document_id, session_id, db)
    DocumentService.delete_document(doc.id, db)
    return {
        "success": True,
        "document_id": document_id,
        "message": "Document and associated vectors permanently removed"
    }
