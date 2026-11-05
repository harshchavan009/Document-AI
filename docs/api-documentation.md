# DocuMind AI: API Specification and Contract

All endpoints are prefixed with `/api`. Responses adhere to a consistent JSON structure or Server-Sent Events (SSE) stream format.

---

## 1. System and Configuration Endpoints

### 1.1 Health Check
- **Endpoint:** `GET /api/health`
- **Description:** Verifies service health, database connectivity, and ChromaDB status.
- **Response 200 OK:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected",
  "vector_store": "ready",
  "timestamp": "2026-11-05T17:30:00Z"
}
```

### 1.2 Runtime Configuration
- **Endpoint:** `GET /api/config`
- **Description:** Exposes public runtime configurations so the frontend never hardcodes limits, file types, or model names.
- **Response 200 OK:**
```json
{
  "allowed_extensions": [".pdf", ".txt"],
  "allowed_mime_types": ["application/pdf", "text/plain"],
  "max_file_size_bytes": 20971520,
  "max_file_size_mb": 20,
  "default_chunk_size": 600,
  "default_chunk_overlap": 100,
  "default_top_k": 5,
  "relevance_threshold": 0.65,
  "embedding_model": "gemini-embedding-001",
  "generation_model": "gemini-2.5-flash"
}
```

---

## 2. Workspace Endpoints

### 2.1 List Workspaces
- **Endpoint:** `GET /api/workspaces`
- **Description:** Retrieves all workspaces belonging to the current session.
- **Response 200 OK:**
```json
{
  "workspaces": [
    {
      "id": "8f3b20e4-5c91-4e78-9e12-8812f84cb731",
      "name": "Research Workspace",
      "description": "Primary document workspace",
      "document_count": 3,
      "created_at": "2026-11-05T17:00:00Z",
      "updated_at": "2026-11-05T17:15:00Z"
    }
  ]
}
```

### 2.2 Create Workspace
- **Endpoint:** `POST /api/workspaces`
- **Request Body:**
```json
{
  "name": "Medical AI Papers",
  "description": "Clinical trials literature"
}
```
- **Response 201 Created:**
```json
{
  "id": "3a7b11c9-1f44-42b8-a765-b123e4567890",
  "name": "Medical AI Papers",
  "description": "Clinical trials literature",
  "created_at": "2026-11-05T17:35:00Z"
}
```

---

## 3. Document Endpoints

### 3.1 Upload Document(s)
- **Endpoint:** `POST /api/documents/upload`
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `workspace_id`: string (UUID)
  - `files`: binary array of PDF or TXT files
- **Response 202 Accepted:**
```json
{
  "uploaded": [
    {
      "id": "e4b3c2a1-0987-6543-21fe-dcba98765432",
      "filename": "Clinical_Trial_Results.pdf",
      "file_size": 2458120,
      "file_type": "application/pdf",
      "status": "Uploaded",
      "created_at": "2026-11-05T17:40:00Z"
    }
  ],
  "rejected": []
}
```

### 3.2 List Documents in Workspace
- **Endpoint:** `GET /api/documents?workspace_id={workspace_id}`
- **Query Parameters:**
  - `workspace_id` (required, UUID)
  - `status` (optional, filter by status)
  - `search` (optional, text filter on filename)
- **Response 200 OK:**
```json
{
  "documents": [
    {
      "id": "e4b3c2a1-0987-6543-21fe-dcba98765432",
      "workspace_id": "8f3b20e4-5c91-4e78-9e12-8812f84cb731",
      "filename": "Clinical_Trial_Results.pdf",
      "file_type": "application/pdf",
      "file_size": 2458120,
      "page_count": 14,
      "chunk_count": 48,
      "status": "Ready",
      "error_message": null,
      "created_at": "2026-11-05T17:40:00Z",
      "updated_at": "2026-11-05T17:42:15Z"
    }
  ],
  "total": 1
}
```

### 3.3 Get Document Status
- **Endpoint:** `GET /api/documents/{document_id}/status`
- **Description:** Polling or SSE endpoint for real-time indexing status.
- **Response 200 OK:**
```json
{
  "id": "e4b3c2a1-0987-6543-21fe-dcba98765432",
  "status": "Generating embeddings",
  "progress_percentage": 65,
  "page_count": 14,
  "chunk_count": 48,
  "error_message": null
}
```

### 3.4 Serve Document File for Preview
- **Endpoint:** `GET /api/documents/{document_id}/file`
- **Description:** Authenticated endpoint serving the raw PDF or text bytes for PDF.js or TXT preview. Includes security headers (`Content-Disposition: inline`, `X-Content-Type-Options: nosniff`).

### 3.5 Reprocess Document
- **Endpoint:** `POST /api/documents/{document_id}/reprocess`
- **Description:** Triggers re-extraction, re-chunking, and re-indexing for a failed or updated document.
- **Response 202 Accepted:**
```json
{
  "id": "e4b3c2a1-0987-6543-21fe-dcba98765432",
  "status": "Uploaded",
  "message": "Reprocessing started"
}
```

### 3.6 Delete Document
- **Endpoint:** `DELETE /api/documents/{document_id}`
- **Description:** Removes the document file from disk, deletes its relational metadata and chunks, and drops all corresponding vector embeddings from ChromaDB.
- **Response 200 OK:**
```json
{
  "success": true,
  "document_id": "e4b3c2a1-0987-6543-21fe-dcba98765432",
  "message": "Document and associated vectors permanently removed"
}
```

---

## 4. Chat and RAG Research Endpoints

### 4.1 Execute Grounded Query
- **Endpoint:** `POST /api/chat/query`
- **Request Body:**
```json
{
  "workspace_id": "8f3b20e4-5c91-4e78-9e12-8812f84cb731",
  "session_id": "optional-chat-session-uuid",
  "document_ids": [
    "e4b3c2a1-0987-6543-21fe-dcba98765432"
  ],
  "question": "What was the efficacy rate observed in Phase 2?",
  "top_k": 5
}
```
- **Response 200 OK:**
```json
{
  "success": true,
  "session_id": "7d2e4f6a-9123-4567-89ab-cdef01234567",
  "answer": "Phase 2 trials demonstrated an efficacy rate of 78.4 percent across the evaluated cohort [1]. Adverse events were mild and observed in fewer than 4 percent of subjects [2].",
  "sources": [
    {
      "citation_index": 1,
      "document_id": "e4b3c2a1-0987-6543-21fe-dcba98765432",
      "filename": "Clinical_Trial_Results.pdf",
      "page_number": 8,
      "chunk_id": "e4b3c2a1-0987-6543-21fe-dcba98765432_24",
      "excerpt": "In the Phase 2 cohort (n=450), the overall therapeutic efficacy rate was determined to be 78.4% compared to baseline.",
      "relevance_distance": 0.18
    },
    {
      "citation_index": 2,
      "document_id": "e4b3c2a1-0987-6543-21fe-dcba98765432",
      "filename": "Clinical_Trial_Results.pdf",
      "page_number": 9,
      "chunk_id": "e4b3c2a1-0987-6543-21fe-dcba98765432_27",
      "excerpt": "Adverse events reported were mild to moderate, occurring in 3.8% of patients with zero Grade 4 reactions.",
      "relevance_distance": 0.24
    }
  ],
  "retrieval_metadata": {
    "retrieved_chunks_count": 5,
    "standalone_query": "What was the efficacy rate observed in Phase 2 clinical trials?"
  }
}
```

### 4.2 Stream Grounded Query (Server-Sent Events)
- **Endpoint:** `POST /api/chat/query/stream`
- **Request Body:** Same as `POST /api/chat/query`.
- **Stream Events:**
  - `event: query_rewritten`: Dispatches the standalone search query.
  - `event: context_retrieved`: Dispatches candidate chunks and relevance statistics.
  - `event: text_delta`: Incremental text chunks from Gemini 2.5 Flash.
  - `event: sources_verified`: Final validated source citation array.
  - `event: done`: Stream termination signal.

### 4.3 Chat History and Session Endpoints
- `GET /api/chat/sessions?workspace_id={workspace_id}`: Lists prior conversations.
- `GET /api/chat/sessions/{session_id}`: Retrieves full message history with citations.
- `DELETE /api/chat/sessions/{session_id}`: Deletes a conversation session.

