# DocuMind AI: Public Production Launch Plan

**Document Version:** 1.0 (Commercial Grade Launch Specification)  
**Author:** Staff Full-Stack Engineer, Site Reliability Engineer, Security Engineer, Product Manager, QA Lead  
**Target:** Safe, Reliable, Public Multi-User Release  
**Status:** Pending Approval  

---

## 1. Plan Overview & Objectives

The goal of this launch plan is to transform DocuMind AI from a strong local project into a commercially credible, publicly accessible web product that external users can open, trust, and rely on, without:
- Leaking private user documents or vector data across tenants.
- Losing uploaded files and databases on container restarts.
- Exhausting the Gemini API budget through abuse or runaway scrapers.
- Leaving documents permanently stuck in broken pipeline states.
- Presenting misleading copy, fake numbers, or unverified claims.

---

## 2. Decision Matrix & Proposals

### 2.1 Account and Isolation Model

#### Analysis of Options
- **Option A: Sign-in with Email Magic Link / OAuth (Google / GitHub)**
  - *Pros:* Strong persistent identity, eliminates cookie clearing risks, easier abuse tracking.
  - *Cons:* High signup friction for first-time visitors who want to test the research desk immediately; requires external auth provider setup (Supabase Auth, Auth0, or custom SMTP mailer).
- **Option B: Cryptographic Anonymous Visitor Sessions with Strict Data-Layer Isolation and Configurable TTL Retention**
  - *Pros:* Zero friction; visitors can immediately upload a document and experience verifiable research; privacy-preserving; documents automatically purged after *N* days (conserving disk space).
  - *Cons:* Clearing browser cookies detaches the visitor from prior sessions.

#### Concrete Recommendation: Enhanced Option B (Session-Bound with Future Auth Schema)
We will maintain the frictionless visitor session model, but completely re-engineer the security boundaries at the ORM data layer:
1. **Tamper-Proof Session Tokens:** The backend will issue signed cryptographic visitor tokens stored in an `httpOnly`, `Secure`, `SameSite=Lax` cookie (with fallback to `X-Session-ID` header for programmatic API access).
2. **Strict Object-Level Authorization (Eliminating DEF-01):**
   - Every database query for documents, chunks, files, and chat sessions will join or filter on `Workspace.session_id == caller_session_id`.
   - If a caller attempts to access, query, download, or delete a document ID or workspace ID that belongs to another session, the server will immediately reject the request with `HTTP 404 Not Found` (preventing ID enumeration).
3. **Data Schema Migration:** Workspaces, Documents, and ChatSessions will reference an `owner_id` (e.g. `anon:uuid` today, `user:uuid` if OAuth is added later), enabling seamless future account upgrades without breaking schema changes.

---

### 2.2 Architecture, Hosting, and Persistence

#### Analysis of Hosting Platforms for a Student / Low-Cost Budget

| Platform | Tier | Monthly Cost | Storage Persistence (SQLite & ChromaDB) | Evaluation |
| :--- | :--- | :--- | :--- | :--- |
| **Railway** | Hobby ($5/mo includes $5 credit) | **~$5 / month** | **Yes (Persistent Volume mount)**. Volumes cost $0.15/GB-mo. Can mount 5GB at `/data`. | **Recommended Primary Option**. Zero rewrite of ChromaDB/SQLite; 100% local parity; simple Docker container. |
| **Render** | Free Web Service | **$0 / month** | **No on free tier**. Disk is wiped on every restart or redeploy. Requires $25/mo Pro plan for disks. | **Unsuitable for SQLite/ChromaDB on free tier**. |
| **Fly.io** | Pay-as-you-go microVM | **~$3 to $5 / month** | **Yes (Fly Volumes)**. Volumes cost $0.15/GB-mo. Shared CPU 256MB/512MB VM. | **Viable alternative**, but lacks free tier for new users and has tighter RAM limits. |
| **Cloudflare Pages / Vercel** | Free Hobby | **$0 / month** | N/A (Static SPA hosting on global edge CDN). | **Recommended Frontend Host**. Automated SSL, custom domain, zero cost. |

#### Recommended Production Hosting Layout
1. **Frontend Tier:** Hosted on **Cloudflare Pages** or **Vercel** (Free).
   - Serves the compiled Vite single-page application.
   - Automatic edge HTTPS, global caching for font bundles, custom domain mapping.
   - Zero compute costs.
2. **Backend & Storage Tier:** Single Docker container hosted on **Railway** ($5/mo Hobby plan).
   - Attaches a **5 GB Persistent Volume** mounted at `/data`.
   - SQLite database path: `/data/documind.db`.
   - ChromaDB persistence directory: `/data/chroma`.
   - Document upload storage directory: `/data/uploads`.
   - Data survives container restarts, redeployments, and scale-to-zero wakeups.
3. **Cold-Start UX Strategy:**
   - On low-cost plans, containers sleep during inactivity.
   - Frontend client implements an active cold-start probe on initial mount. If `/api/health` takes longer than 2.5s, an honest indicator appears: *"Waking up research desk engine (cold start takes 15 to 30 seconds)..."* with an indeterminate progress pulse, preventing confusing network errors.

---

### 2.3 Cost and Abuse Protection

To prevent external users or bots from exhausting the Gemini API quota and driving up costs, the following layered controls will be enforced:

1. **IP and Session Rate Limiting (via `slowapi`):**
   - Ingestion: Max **5 uploads per minute** per IP; max **20 uploads per 24 hours** per session.
   - Grounded Research Queries: Max **10 questions per minute** per IP; max **50 questions per 24 hours** per session.
   - Health and Config endpoints: Max **60 requests per minute** per IP.
2. **Strict File and Scope Boundaries:**
   - Maximum file size: **20 MB** (enforced before body reads).
   - Maximum pages per PDF: **50 pages** (rejects massive textbooks that would cause excessive embedding API calls).
   - Maximum documents per workspace: **10 documents**.
3. **Ingestion Concurrency Limiter:**
   - In-memory worker semaphore limiting concurrent heavy document extractions to **2 concurrent tasks**. Additional jobs queue gracefully.
4. **Global Circuit Breaker:**
   - If the Google Gemini API returns consecutive HTTP 429 (quota exhausted) or 503 errors, the circuit breaker opens for 2 minutes. During this window, incoming queries return an honest notice: *"AI research engine quota is temporarily saturated. Please retry in 2 minutes."* rather than crashing workers.
5. **Transparency via `/api/config`:**
   - Current rate limits, max file sizes, page limits, and daily quotas will be dynamically served by `GET /api/config` and displayed in the Settings page.

---

### 2.4 Reliability and Background Processing

1. **Startup Orphan Job Recovery:**
   - On backend application startup, the database runs an automated recovery query:
     ```sql
     UPDATE documents 
     SET status = 'Failed', 
         error_message = 'Ingestion interrupted by server restart. Click Retry to reprocess.'
     WHERE status IN ('Uploaded', 'Extracting', 'Chunking', 'Embedding', 'Indexing');
     ```
   - Documents will never remain permanently stuck in pending states.
2. **Readiness Probe (`GET /api/ready`):**
   - Distinct from `/api/health` (which only checks process liveness).
   - Validates that:
     - SQLite database is readable and writable.
     - ChromaDB directory is initialized and responsive.
     - Storage disk has at least 500 MB free space.
     - Gemini API key is configured.
3. **SSE Connection Resilience:**
   - Frontend SSE stream parser handles mid-stream network disconnects gracefully, preserving partial answers and offering a "Retry Question" action.

---

### 2.5 Trust and Transparency Features

1. **User Data Purge ("Delete All My Data"):**
   - Endpoint: `DELETE /api/workspaces/purge-session`
   - Atomically purges all workspaces, documents, chunk records, disk files, and ChromaDB vector embeddings belonging to the active visitor session.
   - Exposed as a clear, prominent action in Settings with a confirmation dialog.
2. **Data Export:**
   - Endpoint: `GET /api/workspaces/export-session`
   - Packages all uploaded files and conversational chat histories into a downloadable `.zip` archive for the user.
3. **Automated Data Retention Policy:**
   - Background cleanup task runs daily: Purges workspaces and documents older than *N* days (default: 7 days, configurable via `RETENTION_DAYS`).
   - A clear banner on the research desk informs visitors: *"Documents in guest workspaces are automatically removed after 7 days. Use Delete All Data at any time to purge immediately."*
4. **Real Feedback Channel:**
   - Endpoint: `POST /api/feedback`
   - Persists user bug reports and suggestions into a dedicated `feedback` table in SQLite (`session_id`, `category`, `comment`, `created_at`).
   - Accessible via a "Feedback" button in the header and settings.

---

### 2.6 Content, Discovery, and SEO

1. **Dynamic Page Titles & Route Meta:**
   - Unique title and description for each route (`/`, `/workspace`, `/workspace/documents`, `/workspace/research`, `/docs`, `/settings`).
2. **OpenGraph & Social Sharing Cards:**
   - High-fidelity `og:image` and `twitter:image` generated from the authentic research desk screenshot.
   - Canonical URL tag pointing to production domain.
3. **Search Engine Assets:**
   - `public/robots.txt`: Allows indexing on landing (`/`) and documentation (`/docs`), disallows private user workspaces (`/workspace/*` and `/documents/*`).
   - `public/sitemap.xml`: Lists public indexable routes.
   - `public/manifest.webmanifest`: Progressive Web App metadata and theme colors.

---

### 2.7 Engineering Workflow & CI Pipeline

1. **GitHub Actions Workflow (`.github/workflows/ci.yml`):**
   - Run backend tests: `pytest backend/tests -v`.
   - Run frontend build: `npm --prefix frontend run build`.
   - Run WCAG 2.1 AA accessibility audit: `node frontend/tests/a11y.test.js`.
   - Run secret scan and zero em dash validation.
2. **Docker Parity:**
   - `Dockerfile`: Multi-stage build for Python backend + production static assets or backend container.
   - `docker-compose.yml`: Local multi-container parity with persistent volume mapping to `./storage`.

---

## 3. Implementation Phases & Order of Work

Following user approval, execution will proceed through sequential phases:

### Phase L1: Critical Blockers (Security & Authorization)
- **Task L1.1:** Enforce strict session ownership validation across all routes in `documents.py` and `chat.py`. Neutralize IDOR vulnerability. Add automated cross-tenant security tests.
- **Task L1.2:** Integrate `slowapi` rate limiting and quota middleware on upload and query endpoints.
- **Task L1.3:** Implement page count limit (max 50 pages) during PDF extraction to prevent token exhaustion.
- **Task L1.4:** Replace static percentage tokens in `LandingPage.jsx` and wire file input `accept` tags dynamically.
- **Task L1.5:** Calibrate docstrings in `rag_service.py` and `main.py`.

### Phase L2: Reliability & Operational Hardening
- **Task L2.1:** Implement startup orphan job recovery to unstick interrupted document processing.
- **Task L2.2:** Add `/api/ready` readiness probe and request ID tracking middleware (`X-Request-ID`).
- **Task L2.3:** Implement global Gemini circuit breaker and quota degradation state.
- **Task L2.4:** Build frontend cold-start detection and reconnection banner.
- **Task L2.5:** Create production `Dockerfile` and `docker-compose.yml`.

### Phase L3: Trust, Transparency & Lifecycle
- **Task L3.1:** Implement "Delete All My Data" (`DELETE /api/workspaces/purge-session`).
- **Task L3.2:** Implement "Export My Data" (`GET /api/workspaces/export-session`).
- **Task L3.3:** Implement automated *N*-day data retention reaper.
- **Task L3.4:** Build real user feedback modal and endpoint (`POST /api/feedback`).
- **Task L3.5:** Update Privacy Policy and Terms of Service with real retention, Gemini processing boundaries, and acceptable use terms.

### Phase L4: SEO, Discovery & Public Polish
- **Task L4.1:** Generate `robots.txt`, `sitemap.xml`, and `manifest.webmanifest`.
- **Task L4.2:** Configure OpenGraph and Twitter card metadata in `index.html`.
- **Task L4.3:** Setup GitHub Actions CI workflow (`.github/workflows/ci.yml`).

---

## 4. Immediate Next Step

This launch plan addresses every defect discovered during the audit.  
**Execution will begin immediately upon your approval of this plan.**
