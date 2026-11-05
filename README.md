# DocuMind AI: Grounded AI Document Intelligence Platform

> **Intermediate-Level AI Engineer Internship Evaluation**  
> **Platform:** DocuMind AI  
> **Tagline:** Your documents. Understood intelligently.  
> **Status:** Production-Ready (Verified End-to-End)

---

## 1. Executive Summary and Problem Statement

Modern professionals, researchers, and students struggle with document information overload. Conventional keyword search fails to understand semantic relationships across complex documents, while standard conversational chatbots frequently hallucinate, invent page numbers, or fabricate claims with zero verifiable attribution.

**DocuMind AI** solves this problem by providing a source-grounded research workspace. Users upload multi-page PDF and technical text documents, the system ingests and indexes knowledge using dense vector representations, and users receive streamed answers backed by verifiable page-level citations from their own uploaded documents. If evidence is absent, the system refuses honestly rather than hallucinating.

---

## 2. Product Screenshots (Captured from Live Running System)

All screenshots below represent the genuine, unmocked running application:

### 2.1 Editorial Landing Page & Interactive Preview
![DocuMind AI Landing Page](docs/screenshots/01_landing_page.png)

### 2.2 Workspace Dashboard and Live Computed Metrics
![Workspace Overview](docs/screenshots/02_workspace_overview.png)

### 2.3 Document Library & Multi-Stage Indexing
![Document Library](docs/screenshots/03_document_library.png)

### 2.4 Three-Panel AI Research Canvas & Verified Citations
![AI Research Workspace](docs/screenshots/04_research_workspace.png)

### 2.5 System Specifications & Technical Documentation
![System Documentation](docs/screenshots/05_documentation.png)

### 2.6 Responsive Mobile Viewport (375x812)
![Mobile Research View](docs/screenshots/06_mobile_research.png)

---

## 3. Core Architectural Highlights

1. **Zero Static Data Enforcement:** No hardcoded numbers, fake metrics, synthetic counters, or mock activity feeds. Document counts, extracted pages, chunk volumes, and storage sizes are computed from SQLite database records at render time. File limits and supported MIME types are dynamically served by `GET /api/config`.
2. **True Source Grounding:** Every claim in an answer links to a bracketed citation chip `[1]`, `[2]` that maps to a real chunk and page number.
3. **Server-Side Citation Validation:** After text generation, the backend inspects all cited tokens. Any hallucinated citation index not present in the retrieved chunk candidate set is stripped before finalizing the response.
4. **Honest Insufficient-Context Behavior:** When vector search distances exceed the calibrated relevance threshold (0.65 cosine distance), the system immediately halts generation and returns: *"I could not find sufficient information in your selected documents to answer this question accurately."*
5. **Tool-Grade Editorial Design:** Light mode default with a dedicated dark mode token set, 1px structural hairlines, 8px grid discipline, and zero purple gradients or pill-shaped buttons.
6. **Multi-Tenant Visitor Isolation:** Cryptographically signed session tokens (`dm_session`) isolate workspaces, files, SQLite rows, and ChromaDB vector queries.

---

## 4. Technology Stack

### Backend Tier
- **Language & Framework:** Python 3.14 with FastAPI 0.115+
- **Data Validation & Settings:** Pydantic v2 and `pydantic-settings`
- **Relational Metadata:** SQLite via SQLAlchemy 2.0 (persisting workspaces, documents, chunks, chat sessions, citations)
- **Document Text Extraction:** PyMuPDF (`pymupdf` / `fitz`) page-by-page extraction
- **Vector Database:** ChromaDB 1.5.9 (`chromadb.PersistentClient`) with cosine similarity
- **AI Models (Official Google Gen AI Python SDK):**
  - Text Embeddings: `gemini-embedding-001` (768 dimensions, `task_type="RETRIEVAL_DOCUMENT"` and `RETRIEVAL_QUERY`)
  - Grounded Generation: `gemini-2.5-flash` (streaming text generation)
- **Testing:** `pytest` (23 unit and integration tests)

### Frontend Tier
- **Framework & Build:** React 18 single-page application built with Vite 5
- **Styling & Design System:** Tailwind CSS with custom CSS variable design tokens
- **Icons:** Lucide React (no emoji used as icons)
- **Document Viewing:** `pdfjs-dist` for real in-browser PDF rendering with page jumping
- **Routing:** React Router v6
- **Streaming:** Server-Sent Events (SSE) reader via Fetch Streams API

---

## 5. End-to-End RAG Workflow

```
+-------------------------------------------------------------------------------+
|                             INGESTION PIPELINE                                |
+-------------------------------------------------------------------------------+
[User Upload: PDF or TXT]
       |
       v
[Step 1: Security & Validation]
  - Magic byte inspection (%PDF- header for PDF, clean UTF-8 text for TXT)
  - Content hashing (SHA-256 duplicate detection)
  - Safe server UUID filename allocation on disk
       |
       v
[Step 2: Page-Aware Text Extraction]
  - PyMuPDF sequential page extraction
  - Tracks page numbers (1-indexed) and character offsets
  - Rejects scanned image-only PDFs with explicit "OCR not enabled" reason
       |
       v
[Step 3: Sentence-Aware Token Chunking]
  - 600-token chunk window with 100-token overlap
  - Preserves sentence integrity, start page, and character coordinates
       |
       v
[Step 4: Dense Vector Embedding]
  - Google Gen AI SDK (models/gemini-embedding-001)
  - Task Type: RETRIEVAL_DOCUMENT
  - Batching with exponential retry on rate limits (HTTP 429)
       |
       v
[Step 5: ChromaDB Persistent Storage]
  - Inserts vectors with composite metadata: workspace_id, document_id, page_number
  - Updates SQLite document status to "Ready"
```

```
+-------------------------------------------------------------------------------+
|                             RETRIEVAL & QUERY PIPELINE                        |
+-------------------------------------------------------------------------------+
[User Question + Chat History]
       |
       v
[Step 6: Follow-up Query Expansion]
  - Rewrites conversational follow-up questions with pronouns into standalone queries
       |
       v
[Step 7: Scoped Vector Search]
  - Embeds query via gemini-embedding-001 (task_type=RETRIEVAL_QUERY, 768-dim)
  - Scopes ChromaDB query strictly to user's workspace and selected document IDs
       |
       v
[Step 8: Cosine Distance Calibration]
  - Evaluates retrieved chunk distances against RELEVANCE_THRESHOLD (0.65)
  - If no chunk passes: returns truthful refusal message immediately
       |
       v
[Step 9: Prompt Assembly with Untrusted Context Protection]
  - Encapsulates chunks inside [SOURCE X] tags
  - System prompt instructs model to treat documents as untrusted reference data
       |
       v
[Step 10: Streamed Grounded Answer Generation]
  - Gemini 2.5 Flash streams response tokens via Server-Sent Events (SSE)
  - Model emits bracketed citation tags [1], [2]
       |
       v
[Step 11: Server-Side Citation Validation]
  - Parses cited tags from completed answer
  - Cross-references each cited index against actually retrieved chunks
  - Strips any ungrounded citations; formats source cards with exact excerpts
```

---

## 6. Directory Structure

```
Document-AI/
├── CLAUDE.md                     # Project memory, design tokens, non-negotiable rules
├── README.md                     # Master project documentation
├── .gitignore                    # Environment, storage, and build ignore rules
├── docs/
│   ├── architecture.md           # Multi-tier architecture and relational schema
│   ├── design-research.md        # Research findings from Dropbox Dash, Glean, Linear, Notion
│   ├── design-system.md          # Tokens, typography scale, 8px grid, component inventory
│   ├── rag-workflow.md           # Step-by-step RAG engineering specification
│   ├── api-documentation.md      # OpenAPI REST and SSE endpoint specifications
│   ├── retrieval-evaluation.md   # Distance threshold calibration and test scenarios
│   ├── security-review.md        # Security review, pip-audit, and secret scan report
│   └── screenshots/              # Real application screenshots
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI application with security middleware
│   │   ├── config.py             # Pydantic settings loading from .env
│   │   ├── database.py           # SQLAlchemy SQLite engine and session factory
│   │   ├── models.py             # Relational ORM models
│   │   ├── schemas.py            # Pydantic v2 validation models
│   │   ├── api/
│   │   │   ├── health.py         # GET /api/health
│   │   │   ├── config.py         # GET /api/config
│   │   │   ├── workspaces.py     # Workspace management routes
│   │   │   ├── documents.py      # Document upload, status, file, and deletion routes
│   │   │   └── chat.py           # Grounded RAG query and SSE streaming routes
│   │   ├── services/
│   │   │   ├── document_service.py # Storage management and duplicate detection
│   │   │   ├── extraction_service.py # PyMuPDF and text file text extractors
│   │   │   ├── chunking_service.py   # Token chunking with sentence preservation
│   │   │   ├── embedding_service.py  # Google Gen AI SDK embedding integration
│   │   │   ├── vector_store.py       # ChromaDB PersistentClient vector store
│   │   │   ├── retrieval_service.py  # Query rewriting and scoped retrieval
│   │   │   ├── rag_service.py        # Streamed generation and citation validation
│   │   │   └── job_service.py        # Asynchronous background pipeline worker
│   │   ├── prompts/
│   │   │   └── rag_prompts.py    # Grounding and anti-jailbreak prompt templates
│   │   └── utils/
│   │       ├── file_utils.py     # Magic-byte check and SHA-256 calculation
│   │       ├── security.py       # Visitor session token management
│   │       └── validation.py     # Metadata validation
│   ├── storage/                  # Persistent uploads, ChromaDB, and SQLite database
│   ├── tests/
│   │   ├── conftest.py           # Pytest fixtures and database isolation
│   │   ├── test_upload_validation.py    # Magic-byte, MIME, and size rejection tests
│   │   ├── test_extraction_chunking.py  # PyMuPDF and chunking accuracy tests
│   │   ├── test_embedding_vector_store.py # Persistence and retry tests
│   │   ├── test_retrieval_grounding.py  # Grounding, citation check, and injection tests
│   │   ├── test_lifecycle_security.py   # Deletion and session isolation tests
│   │   └── test_live_integration.py     # End-to-end pipeline integration test
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── public/
    │   └── favicon.svg           # Minimalist DocuMind SVG favicon
    ├── src/
    │   ├── api/
    │   │   └── client.js         # Fetch client with SSE stream parser
    │   ├── components/
    │   │   ├── ui/               # Button, StatusBadge, CitationMarker, EvidenceExcerpt, UploadDropZone
    │   │   ├── layout/           # Sidebar, Header, WorkspaceLayout
    │   │   └── documents/        # PDF.js DocumentPreviewModal
    │   ├── context/
    │   │   ├── ThemeContext.jsx  # Dark/light theme provider
    │   │   └── WorkspaceContext.jsx # Workspace and config state provider
    │   ├── pages/
    │   │   ├── LandingPage.jsx   # Editorial landing page with live component preview
    │   │   ├── OverviewPage.jsx  # Real computed metrics and recent documents
    │   │   ├── DocumentsPage.jsx # Document library with real-time polling
    │   │   ├── ResearchPage.jsx  # Three-panel research workspace
    │   │   ├── DocsPage.jsx      # System documentation page
    │   │   ├── PrivacyPage.jsx   # Real privacy policy
    │   │   ├── TermsPage.jsx     # Terms and conditions
    │   │   └── NotFoundPage.jsx  # Branded 404 page
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 7. API Contract Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns service health, database connection, and ChromaDB vector store status. |
| `GET` | `/api/config` | Exposes dynamic runtime parameters (allowed extensions, max size, chunk size, models). |
| `GET` | `/api/workspaces` | Lists workspaces for active visitor session; auto-seeds default workspace. |
| `POST` | `/api/workspaces` | Creates a new workspace isolated to the current session token. |
| `POST` | `/api/documents/upload` | Multipart upload for PDF/TXT files; magic bytes verified; enqueues background worker. |
| `GET` | `/api/documents` | Lists documents in workspace with live status, page counts, and chunk counts. |
| `GET` | `/api/documents/{id}/status` | Real-time polling endpoint for pipeline stage progression. |
| `GET` | `/api/documents/{id}/file` | Serves raw document file for authenticated PDF.js or TXT preview. |
| `POST` | `/api/documents/{id}/reprocess` | Resets status to `Uploaded` and re-indexes document. |
| `DELETE` | `/api/documents/{id}` | Permanently wipes disk file, SQLite records, and ChromaDB vectors. |
| `POST` | `/api/chat/query` | Synchronous RAG query returning grounded answer, source cards, and metadata. |
| `POST` | `/api/chat/query/stream` | Server-Sent Events (SSE) streaming query with real-time text deltas and validated citations. |
| `GET` | `/api/chat/sessions` | Lists prior research conversation threads. |
| `GET` | `/api/chat/sessions/{id}` | Retrieves conversation thread with historical messages and citations. |
| `DELETE` | `/api/chat/sessions/{id}` | Deletes conversation session and associated message citations. |

---

## 8. Installation and Local Execution

### Prerequisites
- Python 3.11+ (Python 3.14 verified)
- Node.js 18+ (Node.js v20 verified)
- Google Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/))

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Edit .env and insert your GEMINI_API_KEY
# GEMINI_API_KEY=AIzaSy...

# Start the FastAPI server on port 8001
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

The backend server is accessible at `http://127.0.0.1:8001`. Interactive API documentation is available at `http://127.0.0.1:8001/api/docs`.

### 2. Frontend Setup
```bash
# Navigate to frontend directory in a separate terminal
cd frontend

# Install npm dependencies
npm install

# Start the Vite development server on port 5173
npm run dev
```

Open `http://localhost:5173` in your browser. All API requests are proxied automatically to `http://127.0.0.1:8001`.

---

## 9. Automated Testing & Verification

### Run Backend Test Suite
```bash
PYTHONPATH=. pytest backend/tests -v
```
**Test Results (23 of 23 Passed):**
- Valid PDF and TXT file uploads.
- Invalid extension, spoofed MIME, wrong magic bytes, oversize, and binary injection rejections.
- PyMuPDF page-accurate text extraction.
- Scanned PDF without text layer triggers honest failure ("OCR not enabled").
- Sentence-aware chunking boundaries and coordinate metadata preservation.
- ChromaDB vector persistence across restarts.
- Embedding service retry on rate limits (HTTP 429).
- Workspace and document scoping filters.
- Server-side citation validation (filtering out fabricated references).
- Honest refusal on insufficient context.
- Follow-up query rewriting.
- Prompt injection boundary defense.
- Document deletion removing disk file, database rows, and ChromaDB vectors.
- Cross-session multi-tenant access denial.

### Run Frontend Production Build
```bash
cd frontend
npm run build
```
Build output:
- `dist/index.html`: 1.33 kB
- `dist/assets/index.css`: 27.10 kB
- `dist/assets/vendor-react.js`: 161.85 kB
- `dist/assets/vendor-pdf.js`: 364.07 kB
- `dist/assets/index.js`: 79.56 kB
- Zero errors, zero warnings.

---

## 10. Student Internship Submission Summary

This summary provides an explainable overview for evaluation:

1. **What was built:** A full-stack AI Document Intelligence platform (DocuMind AI) combining a Python FastAPI backend and a React 18 frontend. It provides multi-document research, PDF/TXT ingestion, real-time pipeline tracking, and streaming answers backed by page-level citations.
2. **Why these RAG design choices:**
   - **PyMuPDF page tracking:** We extract text page by page so every chunk carries a verified 1-based page number.
   - **Sentence-aware chunking:** Rather than splitting arbitrarily at token counts, we segment on sentence boundaries while preserving 100-token overlaps, preventing fragmented thoughts.
   - **ChromaDB with cosine distance:** Chunks are indexed with workspace and document metadata filters. Queries are scoped strictly to selected documents.
   - **Server-side citation validation:** To eliminate AI hallucinations, the backend parses all citation markers from the model's answer, cross-references them against actually retrieved chunks, and strips any fabricated citation tags before sending the answer to the user.
   - **Honest refusal mechanics:** If retrieved chunks fail the 0.65 cosine distance threshold, the system returns a truthful refusal message rather than guessing.
3. **What was tested:** 23 backend unit and integration tests covering magic-byte spoofing, empty PDFs, chunking boundaries, ChromaDB persistence, multi-tenant isolation, prompt injection defense, and deletion. Frontend production build and browser console errors (0 errors) were verified with automated headless Chrome screenshot captures.
4. **Honest limitations:**
   - OCR is not enabled. Scanned image-only PDFs are rejected honestly.
   - ChromaDB and SQLite run locally in `storage/` on disk. Multi-node cloud deployments require persistent volumes.

---

## 11. Launch and Production Deployment Checklist

- [x] Security headers configured (`nosniff`, `DENY`, `strict-origin-when-cross-origin`).
- [x] Dynamic runtime configuration exposed via `/api/config` (zero static data in frontend).
- [x] Clean SVG favicon and web application metadata in `index.html`.
- [x] Privacy Policy and Terms and Conditions pages accurately reflecting document storage, deletion, and Google Gemini processing.
- [x] `.env` and `backend/.env` protected by `.gitignore` with zero secrets in Git history.
- [x] All 23 backend tests passing.
- [x] Frontend production bundle compiled and code-split under 400 kB per vendor chunk.
- [x] Genuine application screenshots captured from running server.
- [x] Zero em dashes across all code and documentation.
