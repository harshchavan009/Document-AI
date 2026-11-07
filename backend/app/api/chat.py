import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.app.database import get_db, SessionLocal
from backend.app.models import (
    Workspace,
    ChatSession,
    ChatMessage,
    MessageCitation,
    Document,
    DocumentChunk
)
from backend.app.schemas import (
    QueryRequest,
    QueryResponse,
    CitationItem,
    RetrievalMetadata,
    ChatSessionResponse,
    ChatSessionDetailResponse,
    ChatMessageResponse,
    SuggestedQuestionsRequest,
    SuggestedQuestionsResponse
)
from backend.app.config import settings
from backend.app.utils.limiter import limiter
from backend.app.utils.security import (
    get_or_create_session_id,
    verify_workspace_access,
    verify_chat_session_access
)
from backend.app.utils.circuit_breaker import CircuitBreakerOpenException
from backend.app.services.rag_service import RAGService

router = APIRouter(prefix="/chat", tags=["Chat & RAG"])
logger = logging.getLogger(__name__)


@router.post("/query", response_model=QueryResponse)
@limiter.limit(settings.QUERY_RATE_LIMIT)
def query_rag(
    request: Request,
    payload: QueryRequest,
    db: Session = Depends(get_db)
):
    """
    Executes grounded RAG research query.
    Embeds question, performs scoped vector search, builds evidence-grounded prompt,
    generates answer via Gemini, and validates all citations server-side.
    """
    session_id = get_or_create_session_id(request)
    workspace = verify_workspace_access(payload.workspace_id, session_id, db)

    # Resolve or create conversation session
    chat_session = None
    if payload.session_id:
        chat_session = (
            db.query(ChatSession)
            .filter(
                ChatSession.id == payload.session_id,
                ChatSession.workspace_id == workspace.id
            )
            .first()
        )
        if not chat_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
        chat_session = db.query(ChatSession).filter(ChatSession.id == payload.session_id).first()

    if not chat_session:
        # Create a new session with an initial title derived from question
        clean_title = payload.question.strip()[:60]
        chat_session = ChatSession(
            workspace_id=payload.workspace_id,
            title=clean_title if clean_title else "Research Session"
        )
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)

    # Load prior conversation history for context-aware follow-up rewriting
    prior_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == chat_session.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    history = [{"role": m.role, "content": m.content} for m in prior_messages]

    # Record user message
    user_msg = ChatMessage(
        session_id=chat_session.id,
        role="user",
        content=payload.question.strip()
    )
    db.add(user_msg)
    db.commit()

    # Execute RAG pipeline
    rag_service = RAGService()
    try:
        rag_output = rag_service.generate_answer(
            workspace_id=payload.workspace_id,
            question=payload.question.strip(),
            document_ids=payload.document_ids,
            history=history,
            top_k=payload.top_k or 5,
            relevance_threshold=payload.relevance_threshold
        )
    except CircuitBreakerOpenException as cbe:
        logger.warning(f"RAG query blocked by circuit breaker: {cbe}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=cbe.message,
            headers={"Retry-After": str(cbe.retry_after)}
        )
    except Exception as e:
        logger.error(f"RAG query execution error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing AI document research: {str(e)}"
        )

    answer_text = rag_output["answer"]
    validated_sources = rag_output["sources"]
    standalone_query = rag_output["standalone_query"]

    # Record assistant message and citations in database
    asst_msg = ChatMessage(
        session_id=chat_session.id,
        role="assistant",
        content=answer_text,
        retrieval_query=standalone_query
    )
    db.add(asst_msg)
    db.commit()
    db.refresh(asst_msg)

    citation_items = []
    for s in validated_sources:
        cit_record = MessageCitation(
            message_id=asst_msg.id,
            document_id=s["document_id"],
            chunk_id=s.get("chunk_id"),
            citation_index=s["citation_index"],
            relevance_score=s.get("relevance_score"),
            excerpt=s["excerpt"],
            page_number=s["page_number"]
        )
        db.add(cit_record)
        citation_items.append(CitationItem(
            citation_index=s["citation_index"],
            document_id=s["document_id"],
            filename=s["filename"],
            page_number=s["page_number"],
            chunk_id=s.get("chunk_id"),
            excerpt=s["excerpt"],
            relevance_score=s.get("relevance_score")
        ))

    db.commit()

    return QueryResponse(
        success=True,
        session_id=chat_session.id,
        answer=answer_text,
        sources=citation_items,
        retrieval_metadata=RetrievalMetadata(
            retrieved_chunks_count=rag_output["retrieved_count"],
            standalone_query=standalone_query
        )
    )


@router.post("/query/stream")
@limiter.limit(settings.QUERY_RATE_LIMIT)
def query_rag_stream(
    request: Request,
    payload: QueryRequest,
    db: Session = Depends(get_db)
):
    """
    Streams RAG response tokens via Server-Sent Events (SSE).
    Dispatches query_rewritten, context_retrieved, text_delta, sources_verified, and done events.
    """
    session_id = get_or_create_session_id(request)
    workspace = verify_workspace_access(payload.workspace_id, session_id, db)

    chat_session = None
    if payload.session_id:
        chat_session = (
            db.query(ChatSession)
            .filter(
                ChatSession.id == payload.session_id,
                ChatSession.workspace_id == workspace.id
            )
            .first()
        )
        if not chat_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )

    if not chat_session:
        clean_title = payload.question.strip()[:60]
        chat_session = ChatSession(
            workspace_id=payload.workspace_id,
            title=clean_title if clean_title else "Research Session"
        )
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)

    session_id = chat_session.id

    prior_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    history = [{"role": m.role, "content": m.content} for m in prior_messages]

    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=payload.question.strip()
    )
    db.add(user_msg)
    db.commit()

    rag_service = RAGService()

    def event_generator():
        accumulated_answer = []
        verified_sources = []
        standalone_query = payload.question.strip()

        # Initial session event
        yield f"event: session_info\ndata: {json.dumps({'session_id': session_id})}\n\n"

        for event_dict in rag_service.generate_answer_stream(
            workspace_id=payload.workspace_id,
            question=payload.question.strip(),
            document_ids=payload.document_ids,
            history=history,
            top_k=payload.top_k or 5,
            relevance_threshold=payload.relevance_threshold
        ):
            event_name = event_dict.get("event", "message")
            data = event_dict.get("data", {})

            if event_name == "query_rewritten":
                standalone_query = data.get("standalone_query", standalone_query)
            elif event_name == "text_delta":
                accumulated_answer.append(data.get("delta", ""))
            elif event_name == "sources_verified":
                verified_sources = data.get("sources", [])

            yield f"event: {event_name}\ndata: {json.dumps(data)}\n\n"

        # Persist completed stream to database using fresh session
        save_db = SessionLocal()
        try:
            full_text = "".join(accumulated_answer)
            asst_msg = ChatMessage(
                session_id=session_id,
                role="assistant",
                content=full_text,
                retrieval_query=standalone_query
            )
            save_db.add(asst_msg)
            save_db.commit()
            save_db.refresh(asst_msg)

            for s in verified_sources:
                cit_record = MessageCitation(
                    message_id=asst_msg.id,
                    document_id=s.get("document_id", ""),
                    chunk_id=s.get("chunk_id"),
                    citation_index=s.get("citation_index", 1),
                    relevance_score=s.get("relevance_score"),
                    excerpt=s.get("excerpt", ""),
                    page_number=s.get("page_number", 1)
                )
                save_db.add(cit_record)
            save_db.commit()
        except Exception as e:
            logger.error(f"Failed to persist streamed assistant message: {e}")
        finally:
            save_db.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.get("/sessions", response_model=List[ChatSessionResponse])
def list_chat_sessions(
    request: Request,
    workspace_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves all chat sessions in the workspace ordered by recent activity."""
    session_id = get_or_create_session_id(request)
    workspace = verify_workspace_access(workspace_id, session_id, db)
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.workspace_id == workspace.id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )
    return [ChatSessionResponse.model_validate(s) for s in sessions]


@router.get("/sessions/{session_id}", response_model=ChatSessionDetailResponse)
def get_chat_session(
    session_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Retrieves complete conversation thread including verified citations."""
    visitor_session_id = get_or_create_session_id(request)
    session_obj = verify_chat_session_access(session_id, visitor_session_id, db)

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    formatted_messages = []
    for msg in messages:
        citations = []
        # Pre-load document map for citation filenames
        doc_ids = {c.document_id for c in msg.citations}
        docs_map = {d.id: d.filename for d in db.query(Document).filter(Document.id.in_(doc_ids)).all()} if doc_ids else {}

        for c in msg.citations:
            citations.append(CitationItem(
                citation_index=c.citation_index,
                document_id=c.document_id,
                filename=docs_map.get(c.document_id, "Source Document"),
                page_number=c.page_number,
                chunk_id=c.chunk_id,
                excerpt=c.excerpt,
                relevance_score=c.relevance_score
            ))

        formatted_messages.append(ChatMessageResponse(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            retrieval_query=msg.retrieval_query,
            created_at=msg.created_at,
            citations=citations
        ))

    return ChatSessionDetailResponse(
        id=session_obj.id,
        workspace_id=session_obj.workspace_id,
        title=session_obj.title,
        created_at=session_obj.created_at,
        updated_at=session_obj.updated_at,
        messages=formatted_messages
    )


@router.delete("/sessions/{session_id}")
def delete_chat_session(
    session_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Deletes a research conversation thread and all its citations."""
    visitor_session_id = get_or_create_session_id(request)
    session_obj = verify_chat_session_access(session_id, visitor_session_id, db)

    db.delete(session_obj)
    db.commit()
    return {"success": True, "message": "Chat session deleted"}




@router.post("/suggested-questions", response_model=SuggestedQuestionsResponse)
@limiter.limit("15/minute")
def get_suggested_questions(
    request: Request,
    payload: SuggestedQuestionsRequest,
    db: Session = Depends(get_db)
):
    """
    Generates 3 contextual, grounded research questions based on the active documents.
    """
    session_id = get_or_create_session_id(request)
    workspace = verify_workspace_access(payload.workspace_id, session_id, db)

    doc_query = db.query(Document).filter(
        Document.workspace_id == payload.workspace_id,
        Document.status == "Ready"
    )
    if payload.document_ids and len(payload.document_ids) > 0:
        doc_query = doc_query.filter(Document.id.in_(payload.document_ids))
    docs = doc_query.all()

    if not docs:
        return SuggestedQuestionsResponse(questions=[
            "What are the main topics discussed in this workspace?",
            "Can you summarize the documents uploaded so far?",
            "What methodologies or findings are presented?"
        ])

    doc_ids = [d.id for d in docs]
    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id.in_(doc_ids)).order_by(DocumentChunk.chunk_index.asc()).limit(4).all()
    sample_text = "\n\n".join([c.text_content for c in chunks])[:2500]

    if settings.GEMINI_API_KEY and sample_text:
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            prompt = (
                "You are an academic research assistant. Based strictly on the following excerpt from the user's documents, "
                "propose exactly 3 concise, highly specific research questions that can be answered from this text. "
                "Output ONLY a valid JSON list of 3 strings, e.g. [\"question 1\", \"question 2\", \"question 3\"].\n\n"
                f"Document Excerpt:\n{sample_text}"
            )
            response = client.models.generate_content(
                model=settings.GENERATION_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.2)
            )
            raw = response.text.strip()
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0].strip()
            elif "```" in raw:
                raw = raw.split("```")[1].split("```")[0].strip()
            parsed = json.loads(raw)
            if isinstance(parsed, list) and len(parsed) >= 1:
                return SuggestedQuestionsResponse(questions=[str(q).strip() for q in parsed[:3]])
        except Exception as e:
            logger.warning(f"Dynamic suggested questions generation fallback: {e}")

    first_title = docs[0].filename
    return SuggestedQuestionsResponse(questions=[
        f"What is the primary contribution or objective of {first_title}?",
        f"What methodologies or system architectures are described in {first_title}?",
        f"What quantitative results or findings are reported in {first_title}?"
    ])
