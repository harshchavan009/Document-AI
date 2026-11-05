# DocuMind AI: Security Review and Audit Report

## 1. Security Architecture Summary

DocuMind AI implements security by design across ingestion, storage, AI communication, and client presentation. In compliance with the Honesty Rule, this report details verified controls, threat boundaries, audit findings, and acknowledged limitations. We do not claim enterprise certifications (such as SOC-2, HIPAA, or ISO) that have not been externally evaluated.

---

## 2. Verified Security Controls

### 2.1 Credential and Secret Management
- **Backend Isolation:** Google Gemini API keys are consumed strictly within the FastAPI backend environment. API keys are never bundled into frontend assets or transmitted to client browsers.
- **Git Shielding:** The repository `.gitignore` explicitly excludes `.env`, `backend/.env`, `.venv`, and `storage/`.
- **Secret Scan Audit:** An automated regular-expression and entropy scan across all Git commits verified zero leaked keys or private tokens in version control history.

### 2.2 Ingestion & File Security
- **Magic-Byte Inspection:** Uploaded files undergo binary header validation in `verify_magic_bytes()`:
  - PDFs must begin with `%PDF-` bytes. Renamed executables with `.pdf` extensions are rejected.
  - Text files are checked for null-byte sequences (`\x00`) to block embedded binary payloads.
- **Path Traversal Protection:** User-supplied filenames are sanitized (`sanitize_filename()`). Physical storage paths are generated using non-deterministic UUIDs (`uuid.uuid4()`), storing files outside web roots.
- **Content Hashing:** Uploads are hashed with SHA-256 to prevent duplicate processing within a workspace.
- **Storage Limits:** Maximum upload size (20 MB default) is validated both before and during stream ingestion.

### 2.3 Visitor Session Isolation (Multi-Tenancy)
- **Cryptographic Session Tokens:** Each visitor browser receives a cryptographically random cookie (`dm_session`, 32 URL-safe bytes) marked with `HttpOnly`, `SameSite=Lax`, and `Secure` (in production).
- **Relational Scoping:** All database queries for workspaces, documents, and chat sessions enforce `Workspace.session_id == active_session`.
- **Vector Store Scoping:** ChromaDB searches apply composite metadata filters:
  ```python
  where = {"$and": [{"workspace_id": active_workspace}, {"document_id": {"$in": selected_docs}}]}
  ```
- **Automated Verification:** Cross-session access tests confirm that requests from one session identity attempting to access or delete documents belonging to another session return HTTP 404 Not Found.

### 2.4 Prompt Injection and Untrusted Context Defense
- **Untrusted Context Encapsulation:** Retrieved document passages are delimited inside `[SOURCE X] ... [/SOURCE X]` tags.
- **Anti-Jailbreak System Prompts:** The system prompt explicitly instructs the LLM that document content represents untrusted data, never instructions. Commands inside documents attempting to override system behavior are ignored.
- **Server-Side Citation Validation:** Generated answers are scanned for bracketed citation markers. Every cited index is verified against the actually retrieved candidate set. Fabricated citations are stripped before reaching the client.

### 2.5 HTTP Transport and Headers
The FastAPI application injects security headers on all responses:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Disposition: inline` on document previews to prevent automatic browser execution.

---

## 3. Dependency Vulnerability Audit

### 3.1 Python Audit (`pip-audit`)
- **Execution:** Ran `pip-audit` against installed packages in `.test_venv`.
- **Findings:** 5 known CVEs reported in package `chromadb 1.5.9` (advisories PYSEC-2026-311, PYSEC-2026-3813, PYSEC-2026-3814, PYSEC-2026-3815).
- **Impact Assessment:** These advisories primarily affect ChromaDB standalone server deployments (REST API mode) when exposed to untrusted networks. DocuMind AI utilizes ChromaDB embedded as an in-process `PersistentClient` on a local filesystem directory, mitigating remote network exploitation vectors. An update will be applied when upstream wheels for Python 3.14 are released.

### 3.2 Frontend Audit (`npm audit`)
- **Execution:** Ran `npm audit` across 142 frontend packages.
- **Findings:**
  - `esbuild <=0.24.2` (used internally by Vite development server): Moderate severity dev-server request vulnerability. Does not affect production static builds.
  - `react-router 6.28.0`: Moderate severity advisories regarding backslash open-redirect bypass and SSR hydration constructor injection. In DocuMind AI, React Router runs strictly as a client-side SPA without SSR hydration, neutralizing the constructor injection vector.

---

## 4. Threat Model and Known Boundaries

1. **OCR Limitation:** PyMuPDF extracts existing text streams from PDF pages. Scanned image-only PDFs without text layers are explicitly rejected with `Failed: Scanned PDF contains no extractable text. OCR is not enabled.`
2. **Local Storage:** SQLite and ChromaDB data reside in `storage/` on local disk. For multi-node cloud deployments, persistent network volumes or managed cloud databases should be substituted.
