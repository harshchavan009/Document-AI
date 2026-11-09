import os
import io
import zipfile
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Workspace, Document, ChatSession, ChatMessage
from backend.app.schemas import (
    WorkspaceCreate,
    WorkspaceResponse,
    WorkspaceListResponse,
    DocumentResponse,
    DocumentListResponse
)
from backend.app.utils.security import (
    get_or_create_session_id,
    generate_session_token,
    generate_csrf_token,
    verify_workspace_access,
    SESSION_COOKIE_NAME,
    CSRF_COOKIE_NAME
)
from backend.app.services.vector_store import VectorStoreService
from backend.app.config import settings

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


@router.get("", response_model=WorkspaceListResponse)
def list_workspaces(request: Request, db: Session = Depends(get_db)):
    """Lists all workspaces belonging to the active visitor session."""
    session_id = get_or_create_session_id(request)
    workspaces = db.query(Workspace).filter(Workspace.session_id == session_id).all()

    # Automatically initialize a default workspace if session is completely new
    if not workspaces:
        default_ws = Workspace(
            session_id=session_id,
            name="Default Workspace",
            description="Primary research workspace"
        )
        db.add(default_ws)
        db.commit()
        db.refresh(default_ws)
        workspaces = [default_ws]

    res = []
    for ws in workspaces:
        doc_count = db.query(Document).filter(Document.workspace_id == ws.id).count()
        res.append(WorkspaceResponse(
            id=ws.id,
            name=ws.name,
            description=ws.description,
            document_count=doc_count,
            created_at=ws.created_at,
            updated_at=ws.updated_at
        ))

    return WorkspaceListResponse(workspaces=res)


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(
    payload: WorkspaceCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Creates a new workspace isolated to the current visitor session."""
    session_id = get_or_create_session_id(request)
    ws = Workspace(
        session_id=session_id,
        name=payload.name.strip(),
        description=payload.description.strip() if payload.description else None
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    return WorkspaceResponse(
        id=ws.id,
        name=ws.name,
        description=ws.description,
        document_count=0,
        created_at=ws.created_at,
        updated_at=ws.updated_at
    )


@router.delete("/purge-session")
def purge_session_data(request: Request, response: Response, db: Session = Depends(get_db)):
    """
    Atomically purges all workspaces, uploaded documents, disk files,
    ChromaDB vectors, and chat sessions for the active visitor session.
    Assigns a fresh session token upon completion.
    """
    session_id = get_or_create_session_id(request)
    workspaces = db.query(Workspace).filter(Workspace.session_id == session_id).all()
    vs = VectorStoreService()

    for ws in workspaces:
        docs = db.query(Document).filter(Document.workspace_id == ws.id).all()
        for d in docs:
            if d.storage_path and os.path.exists(d.storage_path):
                try:
                    os.remove(d.storage_path)
                except Exception as e:
                    pass

        try:
            vs.delete_workspace(ws.id)
        except Exception:
            pass

        db.delete(ws)

    db.commit()

    # Issue a brand new session token so client starts completely fresh
    new_token = generate_session_token()
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=new_token,
        httponly=True,
        samesite="lax",
        secure=settings.APP_ENV == "production",
        max_age=60 * 60 * 24 * 30
    )
    new_csrf = generate_csrf_token()
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=new_csrf,
        httponly=False,
        samesite="lax",
        secure=settings.APP_ENV == "production",
        max_age=60 * 60 * 24 * 30
    )
    response.headers["X-New-Session-ID"] = new_token
    response.headers["X-CSRF-Token"] = new_csrf

    return {
        "success": True,
        "message": "All workspace data, documents, vector embeddings, and conversation records have been permanently purged.",
        "new_session_id": new_token
    }


@router.get("/export-session")
def export_session_data(request: Request, db: Session = Depends(get_db)):
    """
    Packages all uploaded files and conversation histories for the active session
    into a downloadable .zip archive.
    """
    session_id = get_or_create_session_id(request)
    workspaces = db.query(Workspace).filter(Workspace.session_id == session_id).all()

    buf = io.BytesIO()
    timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as archive:
        manifest_docs = []
        manifest_chats = []

        for ws in workspaces:
            # 1. Archive documents
            docs = db.query(Document).filter(Document.workspace_id == ws.id).all()
            for d in docs:
                manifest_docs.append({
                    "id": d.id,
                    "filename": d.filename,
                    "workspace": ws.name,
                    "page_count": d.page_count,
                    "chunk_count": d.chunk_count,
                    "file_size": d.file_size
                })
                if d.storage_path and os.path.exists(d.storage_path):
                    with open(d.storage_path, "rb") as fp:
                        archive.writestr(f"documents/{ws.name}/{d.filename}", fp.read())

            # 2. Archive chat conversations
            chats = db.query(ChatSession).filter(ChatSession.workspace_id == ws.id).all()
            for cs in chats:
                messages = (
                    db.query(ChatMessage)
                    .filter(ChatMessage.session_id == cs.id)
                    .order_by(ChatMessage.created_at.asc())
                    .all()
                )
                chat_data = {
                    "id": cs.id,
                    "title": cs.title,
                    "workspace": ws.name,
                    "created_at": cs.created_at.isoformat() if cs.created_at else None,
                    "messages": [
                        {
                            "role": m.role,
                            "content": m.content,
                            "retrieval_query": m.retrieval_query,
                            "created_at": m.created_at.isoformat() if m.created_at else None,
                            "citations": [
                                {
                                    "citation_index": c.citation_index,
                                    "page_number": c.page_number,
                                    "excerpt": c.excerpt
                                }
                                for c in m.citations
                            ]
                        }
                        for m in messages
                    ]
                }
                manifest_chats.append({"id": cs.id, "title": cs.title})
                safe_title = "".join(c for c in cs.title if c.isalnum() or c in " _-")[:40] or cs.id[:8]
                archive.writestr(
                    f"conversations/{ws.name}/{safe_title}.json",
                    json.dumps(chat_data, indent=2)
                )

        # 3. Write manifest.json
        manifest = {
            "app": "DocuMind AI",
            "version": settings.APP_VERSION,
            "export_date": datetime.now(timezone.utc).isoformat(),
            "workspaces_count": len(workspaces),
            "documents_count": len(manifest_docs),
            "conversations_count": len(manifest_chats),
            "documents": manifest_docs,
            "conversations": manifest_chats
        }
        archive.writestr("manifest.json", json.dumps(manifest, indent=2))

    buf.seek(0)
    filename = f"documind_export_{timestamp_str}.zip"

    return Response(
        content=buf.getvalue(),
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace(workspace_id: str, request: Request, db: Session = Depends(get_db)):
    """Retrieves workspace metadata with strict session verification."""
    session_id = get_or_create_session_id(request)
    ws = (
        db.query(Workspace)
        .filter(Workspace.id == workspace_id, Workspace.session_id == session_id)
        .first()
    )
    if not ws:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )

    doc_count = db.query(Document).filter(Document.workspace_id == ws.id).count()
    return WorkspaceResponse(
        id=ws.id,
        name=ws.name,
        description=ws.description,
        document_count=doc_count,
        created_at=ws.created_at,
        updated_at=ws.updated_at
    )


@router.get("/{workspace_id}/documents", response_model=DocumentListResponse)
def list_workspace_documents(
    workspace_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Lists all documents contained within the specified workspace.
    Enforces multi-tenant session verification and workspace boundary isolation.
    """
    session_id = get_or_create_session_id(request)
    workspace = verify_workspace_access(workspace_id, session_id, db)
    docs = (
        db.query(Document)
        .filter(Document.workspace_id == workspace.id)
        .order_by(Document.created_at.desc())
        .all()
    )
    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(doc) for doc in docs],
        total=len(docs)
    )


@router.delete("/{workspace_id}")
def delete_workspace(workspace_id: str, request: Request, db: Session = Depends(get_db)):
    """Deletes workspace, all associated documents, and ChromaDB vector embeddings."""
    session_id = get_or_create_session_id(request)
    ws = (
        db.query(Workspace)
        .filter(Workspace.id == workspace_id, Workspace.session_id == session_id)
        .first()
    )
    if not ws:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )

    # Purge vectors from ChromaDB
    try:
        vs = VectorStoreService()
        vs.delete_workspace(ws.id)
    except Exception:
        pass

    db.delete(ws)
    db.commit()
    return {"success": True, "message": "Workspace deleted successfully"}

