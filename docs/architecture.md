# DocuMind AI: System Architecture Specification

## 1. Architectural Overview

DocuMind AI is architected as a decoupled, multi-tiered document intelligence platform. It combines a high-performance Python (FastAPI) asynchronous backend with a modern React client. The architecture emphasizes clear separation of concerns, persistent data isolation, deterministic document processing, and verifiable source grounding.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  React 18 SPA (Vite, Tailwind CSS, Lucide Icons, Headless UI, PDF.js)             |
|  - Landing Page & System Specs                                                    |
|  - Workspace Shell & Sidebar                                                      |
|  - Real-Time Document Library (Upload, Status SSE/Polling, File Management)       |
|  - Three-Panel AI Research Canvas (Documents, Chat Composer, Source Inspector)    |
|  - Document Viewer (Page-accurate PDF & TXT preview with excerpt focus)          |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | HTTPS / REST / SSE Stream
                                          v
+-----------------------------------------------------------------------------------+
|                                BACKEND TIER (FastAPI)                             |
|  +-----------------------------------------------------------------------------+  |
|  | API Routing & Middleware Layer                                              |  |
|  | - Security Headers, CORS, Rate Limiting (slowapi)                           |  |
|  | - Session Identity & Workspace Isolation Middleware                         |  |
|  | - Centralized Error Envelope & Pydantic v2 Request/Response Validation     |  |
|  +-----------------------------------------------------------------------------+  |
|                                         |                                         |
|  +--------------------------------------+--------------------------------------+  |
|  | Core Services                                                               |  |
|  | - DocumentService (Upload validation, magic bytes, safe UUID naming)         |  |
|  | - ExtractionService (PyMuPDF for PDF with page tracking, TXT with fallback)|  |
|  | - ChunkingService (Token-aware recursive splitting, page boundary tagging)  |  |
|  | - EmbeddingService (Google Gen AI SDK with gemini-embedding-001)            |  |
|  | - VectorStore (ChromaDB PersistentClient with metadata filtering)           |  |
|  | - RetrievalService (Vector similarity query, score thresholding)            |  |
|  | - RAGService (Prompt builder, Gemini 2.5 streaming, citation validation)    |  |
|  | - JobService (Background async pipeline orchestration & status reporting)   |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------+-----------------------------------------+
                                          |
                   +----------------------+----------------------+
                   |                                             |
                   v                                             v
+------------------------------------+         +------------------------------------+
|          PERSISTENT STORAGE        |         |          EXTERNAL SERVICES         |
|  - SQLite (SQLAlchemy 2.0):        |         |  - Google Gen AI API:              |
|    Workspaces, Documents, Chunks,  |         |    - Embedding:                    |
|    Jobs, Sessions, Citations       |         |      models/gemini-embedding-001   |
|  - File System Storage:            |         |    - Generation:                   |
|    Safe hashed local documents     |         |      models/gemini-2.5-flash       |
|  - ChromaDB Persistent Store:      |         |                                    |
|    Vector index with metadata      |         +------------------------------------+
+------------------------------------+
```

---

## 2. Component Layer Responsibilities

### 2.1 API and Security Layer
- **Session Identification:** Every client request carries a secure, per-visitor session identity (via signed HTTP cookie or bearer token). All workspace, document, and chat operations are strictly filtered by this identity.
- **Input Validation:** Strict Pydantic v2 schemas for all payloads. File uploads undergo magic-byte verification (checking `%PDF` header for PDFs and UTF/ASCII encoding validity for text files) to prevent extension spoofing.
- **Dynamic Configuration (`GET /api/config`):** Public endpoint serving current runtime settings (accepted MIME types, file size limits, retrieval parameters, model identifiers). The frontend consumes this to ensure zero hardcoded constraints.

### 2.2 Ingestion and Processing Pipeline
- **Asynchronous Execution:** Document upload returns immediately with an initial `Uploaded` record and job ID. Processing runs via FastAPI background tasks or worker routines.
- **Multi-Stage State Tracking:** Documents progress through discrete, auditable states:
  1. `Uploaded`: File stored with safe UUID filename; content hash computed.
  2. `Extracting`: Text extracted per-page via PyMuPDF or text decoder.
  3. `Chunking`: Text segmented with overlap, preserving page numbers and character offsets.
  4. `Generating embeddings`: Dense vectors generated via `gemini-embedding-001`.
  5. `Indexing`: Vectors inserted into ChromaDB with metadata.
  6. `Ready`: Available for retrieval.
  7. `Failed`: Terminal error state with descriptive, non-sensitive reason.

### 2.3 Vector Database Layer (ChromaDB)
- **Persistence:** Initialized via `chromadb.PersistentClient(path="./storage/chroma")`.
- **Collection Isolation:** Vectors are stored with comprehensive metadata:
  - `workspace_id`: Isolates search to specific user workspaces.
  - `document_id`: Allows filtering search to user-selected subsets of documents.
  - `page_number`: Enables accurate page-level attribution.
  - `chunk_index`: Preserves sequential chunk order.
- **Lifecycle Management:** Deleting a document removes its vectors from ChromaDB via `collection.delete(where={"document_id": doc_id})` and removes the file and database metadata simultaneously.

### 2.4 Retrieval-Augmented Generation (RAG) Layer
- **Query Embedding:** User question is embedded using `task_type="RETRIEVAL_QUERY"` via the Google Gen AI SDK.
- **Scoped Vector Search:** ChromaDB queries are executed with explicit metadata filters for the active workspace and selected document IDs.
- **Relevance Calibration:** Retrieved chunks are scored. If all results fall below the configured relevance threshold (e.g., cosine distance limit), the system short-circuits to an honest insufficient-context response.
- **Context Synthesis and Grounding:** Relevant chunks are wrapped in delimited blocks with unique source tags (`[SOURCE_1]`, `[SOURCE_2]`).
- **Generation with Gemini:** Streamed answer generation utilizing `gemini-2.5-flash` with system prompts enforcing factual adherence.
- **Server-Side Citation Validation:** After generation, cited chunk tags are cross-checked against actually retrieved chunks. Any ungrounded hallucinated citations are stripped before finalizing the response.

---

## 3. Data Storage Model

### 3.1 Relational Schema (SQLite via SQLAlchemy)

#### Table: `workspaces`
- `id` (VARCHAR(36), Primary Key): UUID identifier.
- `session_id` (VARCHAR(64), Indexed): Owner visitor or user session token.
- `name` (VARCHAR(128)): Human-readable workspace name.
- `description` (TEXT, Nullable): Optional workspace notes.
- `created_at` (DATETIME): UTC creation timestamp.
- `updated_at` (DATETIME): UTC last modification timestamp.

#### Table: `documents`
- `id` (VARCHAR(36), Primary Key): UUID identifier.
- `workspace_id` (VARCHAR(36), Foreign Key -> `workspaces.id`, Indexed): Owning workspace.
- `filename` (VARCHAR(255)): Original user-provided file name.
- `storage_path` (VARCHAR(512)): Safe filesystem path on disk.
- `file_type` (VARCHAR(32)): Verified MIME type (`application/pdf`, `text/plain`).
- `file_size` (INTEGER): File size in bytes.
- `file_hash` (VARCHAR(64), Indexed): SHA-256 hash for duplicate detection.
- `page_count` (INTEGER, Default 0): Total pages extracted.
- `chunk_count` (INTEGER, Default 0): Total chunks generated and indexed.
- `status` (VARCHAR(32)): Current state (`Uploaded`, `Extracting`, `Chunking`, `Generating embeddings`, `Indexing`, `Ready`, `Failed`).
- `error_message` (TEXT, Nullable): Human-readable error description on failure.
- `created_at` (DATETIME): UTC upload timestamp.
- `updated_at` (DATETIME): UTC status change timestamp.

#### Table: `document_chunks`
- `id` (VARCHAR(36), Primary Key): Unique chunk ID (e.g., `docId_chunkIndex`).
- `document_id` (VARCHAR(36), Foreign Key -> `documents.id`, Indexed): Owning document.
- `chunk_index` (INTEGER): Sequential order within the document.
- `page_number` (INTEGER): Source page number (1-indexed for user clarity).
- `character_start` (INTEGER): Starting character offset in page text.
- `character_end` (INTEGER): Ending character offset in page text.
- `text_content` (TEXT): The actual chunk text.
- `token_count` (INTEGER): Token count estimate.
- `created_at` (DATETIME): UTC creation timestamp.

#### Table: `chat_sessions`
- `id` (VARCHAR(36), Primary Key): UUID session identifier.
- `workspace_id` (VARCHAR(36), Foreign Key -> `workspaces.id`, Indexed): Active workspace.
- `title` (VARCHAR(255)): Auto-generated or user-edited conversation title.
- `created_at` (DATETIME): UTC creation timestamp.
- `updated_at` (DATETIME): UTC last activity timestamp.

#### Table: `chat_messages`
- `id` (VARCHAR(36), Primary Key): UUID identifier.
- `session_id` (VARCHAR(36), Foreign Key -> `chat_sessions.id`, Indexed): Parent conversation.
- `role` (VARCHAR(16)): `user` or `assistant`.
- `content` (TEXT): Raw message text.
- `retrieval_query` (TEXT, Nullable): Rewritten or executed search query.
- `created_at` (DATETIME): UTC creation timestamp.

#### Table: `message_citations`
- `id` (VARCHAR(36), Primary Key): UUID identifier.
- `message_id` (VARCHAR(36), Foreign Key -> `chat_messages.id`, Indexed): Assistant message.
- `document_id` (VARCHAR(36), Foreign Key -> `documents.id`): Source document.
- `chunk_id` (VARCHAR(36), Foreign Key -> `document_chunks.id`): Cited chunk.
- `citation_index` (INTEGER): Inline reference index (`1`, `2`, etc.).
- `relevance_score` (FLOAT, Nullable): Vector distance or similarity score.
- `excerpt` (TEXT): Cited passage text.
- `page_number` (INTEGER): Verified page number.

---

## 4. Multi-Tenant Isolation Strategy

Even without mandatory user accounts, multi-tenancy is enforced at the database and filesystem level:
1. Every browser client receives a cryptographically signed cookie (`dm_session`) generated with `secrets.token_urlsafe(32)` on initial arrival.
2. All workspace queries, document queries, file downloads, and vector queries require matching `session_id`.
3. ChromaDB similarity searches apply strict filtering using `where={"$and": [{"workspace_id": active_workspace}, {"document_id": {"$in": selected_docs}}]}`.
4. Attempting to access a document ID belonging to a different session results in an immediate HTTP 404 (or 403), tested and verified by automated security test suites.

