# DocuMind AI: Security Review and Audit Report

## 1. Security Architecture Summary

DocuMind AI implements security by design across ingestion, storage, AI communication, transport, and client presentation. In compliance with the Honesty Rule, this report details verified controls, threat boundaries, audit findings, and acknowledged limitations. We do not claim enterprise certifications (such as SOC-2, HIPAA, or ISO) that have not been externally evaluated.

---

## 2. Verified Security Controls

### 2.1 Credential and Secret Management
- **Backend Isolation:** Google Gemini API keys are consumed strictly within the FastAPI backend environment. API keys are never bundled into frontend assets or transmitted to client browsers.
- **Git Shielding:** The repository `.gitignore` explicitly excludes `.env`, `backend/.env`, `.venv`, and `storage/`.
- **Git History Secret Audit:** Regular expression scans across all Git commits verified zero leaked keys, tokens, or credentials in version control history:
  - Scanned for Google API keys (`AIza[0-9A-Za-z_-]{35}`): 0 matches.
  - Scanned for AWS access keys (`AKIA[0-9A-Z]{16}`): 0 matches.
  - Scanned for private keys (`BEGIN PRIVATE KEY`): 0 matches.
  - Scanned for GitHub tokens (`ghp_[0-9a-zA-Z]{36}`): 0 matches.

### 2.2 Ingestion & File Security
- **Magic-Byte Inspection:** Uploaded files undergo binary header validation in `verify_magic_bytes()`:
  - PDFs must begin with `%PDF-` bytes. Renamed executables with `.pdf` extensions are rejected.
  - Text files are checked for null-byte sequences (`\x00`) to block embedded binary payloads.
- **Path Traversal Protection:** User-supplied filenames are sanitized (`sanitize_filename()`). Physical storage paths are generated using non-deterministic UUIDs (`uuid.uuid4()`), storing files outside web roots.
- **Content Hashing:** Uploads are hashed with SHA-256 to prevent duplicate processing within a workspace.
- **Storage Limits:** Maximum upload size (20 MB default) and maximum page count (50 pages per PDF default) are validated before and during ingestion.

### 2.3 Visitor Session Isolation & Anti-CSRF Defense
- **Encrypted Visitor Identity:** Each visitor browser receives a cryptographically secure token (`dm_session`, 256 bits of entropy via `secrets.token_urlsafe(32)`) stored strictly in an `HttpOnly`, `SameSite=Lax`, and `Secure` (in production) cookie.
- **No Client-Side Token Storage:** LocalStorage token generation was completely eliminated. The raw session token is never rendered in HTML, preventing shoulder-surfing and XSS exfiltration.
- **CSRF Double-Submit Token Defense:**
  - A dedicated `dm_csrf` cookie is issued alongside the session.
  - Mutating HTTP methods (`POST`, `PUT`, `DELETE`, `PATCH`) require the matching `X-CSRF-Token` header.
  - Tokens are validated using constant-time comparison (`secrets.compare_digest()`) to prevent timing attacks.
  - Missing or mismatched tokens are rejected immediately with HTTP 403 Forbidden.
- **Relational Scoping:** All database queries for workspaces, documents, and chat sessions enforce `Workspace.session_id == active_session`.
- **Vector Store Scoping:** ChromaDB queries enforce strict composite workspace and document ID filters:
  ```python
  where = {"$and": [{"workspace_id": active_workspace}, {"document_id": {"$in": selected_docs}}]}
  ```
- **Automated Verification:** 13 dedicated automated tests in `backend/tests/test_isolation_security.py` confirm cross-session document listing, download, reprocessing, chat querying, and deletion are rejected.

### 2.4 Prompt Injection and Untrusted Context Defense
- **Untrusted Context Encapsulation:** Retrieved document passages are delimited inside `[SOURCE X] ... [/SOURCE X]` tags.
- **Anti-Jailbreak System Prompts:** The system prompt explicitly instructs the LLM that document content represents untrusted data, never instructions. Commands inside documents attempting to override system behavior are ignored.
- **Server-Side Citation Validation:** Generated answers are scanned for bracketed citation markers. Every cited index is verified against the actually retrieved candidate set. Fabricated citations (e.g. `[99]`) are stripped before reaching the client.

### 2.5 HTTP Transport and Headers
The FastAPI application injects security headers on all responses:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Disposition: inline` on document previews to prevent automatic browser execution.
- `Cache-Control: no-cache, no-store, must-revalidate` on SPA entry points to prevent stale caching.

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
3. **Session Continuity:** Because visitor identity relies on httpOnly cookies, clearing browser cookies resets the visitor session. Users can export all workspace data via the Export Data action prior to clearing browser state.
