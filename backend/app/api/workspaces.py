from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Workspace, Document
from backend.app.schemas import (
    WorkspaceCreate,
    WorkspaceResponse,
    WorkspaceListResponse
)
from backend.app.utils.security import get_or_create_session_id
from backend.app.services.vector_store import VectorStoreService

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
