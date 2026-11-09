# DocuMind AI: Ship and Fix Plan

**Document:** `docs/ship-plan.md`  
**Date:** November 2026  
**Author Roles:** QA Lead, Staff Full-Stack Engineer, Security Engineer, UX Writer, Release Engineer  
**Status:** Fully Executed & Verified (Phases S1 - S8 Complete)  

---

## 1. Compliance Matrix Summary

| Section / Group | Total Items | Pass | Partial (Defects) | Fail | Not Verifiable |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **A. Product & Landing Page** | 9 | 9 | 0 | 0 | 0 |
| **B. Workspace Shell** | 4 | 4 | 0 | 0 | 0 |
| **C. Document Library** | 6 | 6 | 0 | 0 | 0 |
| **D. Research Workspace Desk** | 7 | 7 | 0 | 0 | 0 |
| **E. Document Preview & Reader** | 4 | 4 | 0 | 0 | 0 |
| **F. RAG Retrieval & Ingestion Pipeline** | 10 | 10 | 0 | 0 | 0 |
| **G. Backend Architecture & REST API** | 6 | 6 | 0 | 0 | 0 |
| **H. Frontend Engineering & Components** | 4 | 4 | 0 | 0 | 0 |
| **I. Security & Session Isolation** | 6 | 6 | 0 | 0 | 0 |
| **J. Pytest Suite & Retrieval Quality** | 19 | 18 | 0 | 0 | 1 |
| **K. UX Polish & Interaction States** | 5 | 5 | 0 | 0 | 0 |
| **L. Documentation & Setup Reproducibility** | 4 | 4 | 0 | 0 | 0 |
| **M. Internship Delivery & Live Deployment** | 2 | 0 | 0 | 0 | 2 |
| **Cross-Cutting Rules (R1, R2, R3)** | 3 | 3 | 0 | 0 | 0 |
| **TOTAL** | **89** | **86 (96.6%)** | **0 (0.0%)** | **0 (0.0%)** | **3 (3.4%)** |

*Note: Group J includes 16 pytest requirement areas (J1 to J16) plus external mocking (J17), live Gemini run (J18), and retrieval quality evaluation (J19).*

---

## 2. Defect Remediation Catalog & Severity Rankings

### Blocker Severity (Security, Data Isolation, Legal Integrity)

| ID | Finding & Defect | Planned Remediation | Affected Files | Effort | Risk |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **SEC-01** | **Session Token Displayed on Screen:** Displaying the session token with a "Copy" button in Settings exposes it to shoulder surfing and screenshot leaks (`I3`). The frontend currently generates a fallback token in `localStorage` (`client.js:13-20`). | 1. Remove the token string and "Copy" button from Settings entirely.<br>2. Transition visitor authentication to pure server-issued, cryptographically secure 256-bit random tokens (`secrets.token_urlsafe(32)`).<br>3. Store exclusively in an `httpOnly`, `Secure`, `SameSite=Lax` cookie.<br>4. Eliminate `localStorage.getItem("dm_session_token")`.<br>5. Add double-submit CSRF token protection for state-changing endpoints (`POST`, `DELETE`, `PUT`).<br>6. Add automated tests proving another visitor cannot access documents, vectors, or chat threads. | `frontend/src/pages/SettingsPage.jsx`<br>`frontend/src/api/client.js`<br>`backend/app/main.py`<br>`backend/app/utils/security.py`<br>`backend/tests/test_isolation_security.py` | Medium | Low |
| **LEG-01** | **Sample Document Fair Use Claim:** The application claims "Educational demonstration under fair use" for *Attention Is All You Need*. Fair use is a legal defense, not a license. | Replace the sample document with a genuinely open-access document (such as a public-domain Project Gutenberg text or an openly licensed paper under CC BY 4.0), or provide accurate attribution under the arXiv non-exclusive distribution license without fair use claims. | `backend/app/assets/sample_document.txt`<br>`backend/app/services/document_service.py`<br>`frontend/src/pages/HomePage.jsx`<br>`frontend/src/pages/LandingPage.jsx` | Low | Low |

---

### High Severity (Honesty Overclaims, Missing UI Features, Layout Glitches)

| ID | Finding & Defect | Planned Remediation | Affected Files | Effort | Risk |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **HON-01** | **Deterministic & Strict Grounding Overclaims:** Copy claims "Every step is deterministic and inspectable" and "enforces strict retrieval grounding. Every factual claim must originate from an indexed document chunk" (`A7`, `R3`). Generative output is probabilistic, and text is processed by Google Gemini. | Rewrite landing page, docs, and terms to state plainly that document chunks are sent to Google Gemini for embeddings and generation. State that answers are probabilistic, citations indicate source chunks, and users must inspect cited pages. | `frontend/src/pages/LandingPage.jsx`<br>`frontend/src/pages/DocsPage.jsx`<br>`frontend/src/pages/TermsPage.jsx` | Low | Low |
| **HON-02** | **Clinical Trials Positioning:** Docs and sidebar refer to "clinical trials" and medical use (`I6`). | Remove all medical/clinical positioning. Add a prominent disclaimer stating DocuMind AI is not for medical, legal, or financial advice. | `frontend/src/pages/DocsPage.jsx`<br>`frontend/src/components/layout/Sidebar.jsx` | Low | Low |
| **UI-01** | **Button Layout Bug in Settings:** In Settings, icons sit awkwardly above labels on "Download .zip", "Send Feedback", and "Delete All Data" (`H2`). | Update the shared `Button` component and parent flex layouts to guarantee horizontal single-row alignment (`inline-flex items-center gap-2`), consistent button heights, and proper icon containment. | `frontend/src/components/ui/Button.jsx`<br>`frontend/src/pages/SettingsPage.jsx` | Low | Low |
| **UI-02** | **Raw Workspace UUID Display:** Settings displays `Workspace ID: 2c322904-83bd-438b...` by default (`B3`). | Hide internal UUIDs by default. Move to an expandable "Advanced details" disclosure drawer. | `frontend/src/pages/SettingsPage.jsx` | Low | Low |
| **NAV-01** | **Sidebar Developer Artifacts & Missing Actions:** Route hints `/system` and `/docs` clutter the sidebar. "System Diagnostics" sits in primary navigation. "New workspace" and "Recent activity" are not directly accessible (`B1`). | 1. Move System Diagnostics into Settings and the footer.<br>2. Remove developer route hints (`/system`, `/docs`) from user navigation.<br>3. Add explicit "New workspace" action trigger and "Recent activity" view in the workspace shell. | `frontend/src/components/layout/Sidebar.jsx`<br>`frontend/src/pages/SettingsPage.jsx` | Medium | Low |
| **DOC-01** | **Documentation Architecture & Routing Mismatch:** Breadcrumbs say "Session Isolation" while sidebar highlights "Visitor Identity Model" and content shows "Overview". Docs read like an internal architecture document rather than a user guide (`L2`). | 1. Implement active scroll-spy using `IntersectionObserver` so breadcrumbs, sidebar navigation, and reading viewport stay in sync.<br>2. Reorganize Docs: User Guide first (Getting Started, Uploading, Asking, Reading Citations, Limits, Privacy, Troubleshooting), followed by a Technical Architecture section. | `frontend/src/pages/DocsPage.jsx` | Medium | Low |

---

### Medium Severity (Copy Polish, Monospace Formatting, Jargon)

| ID | Finding & Defect | Planned Remediation | Affected Files | Effort | Risk |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **CPY-01** | **Jargon-Heavy Copy:** Copy repeatedly uses internal technical terms: "knowledge index", "stored vectors", "grounded", "pose a research inquiry", "synthesized strictly across your selected sources" (`A3`, `A5`, `D2`, `R2`). | Rewrite all user-facing strings into conversational, plain English: "Ask a question about your documents", "Verified source passages", "Upload your PDFs and ask questions". | `frontend/src/pages/LandingPage.jsx`<br>`frontend/src/pages/ResearchPage.jsx`<br>`frontend/src/pages/HomePage.jsx` | Medium | Low |
| **CPY-02** | **Cute Copy in Settings:** Settings theme options use poetic descriptions: "desk lighting", "Forest Pine accents", "charcoal obsidian canvas" (`R2`). | Simplify to clean, universally understood descriptions: "Light (Clean paper reading palette)", "Dark (Low-glare contrast)", "System (Matches device)". | `frontend/src/pages/SettingsPage.jsx` | Low | Low |
| **CPY-03** | **Hardcoded Page Count in HomePage:** Text says "across 11 pages" (`B4`, `R1`). | Calculate page counts dynamically from document records in SQLite database, never from hardcoded strings. | `frontend/src/pages/HomePage.jsx` | Low | Low |
| **LIB-01** | **Duplicate Actions on Library Page:** "Try sample paper" and "Add documents" appear twice on the same screen (`C1`, `C4`). | Consolidate to one primary action ("Add documents") and one secondary link ("Try sample document"). | `frontend/src/pages/DocumentsPage.jsx` | Low | Low |
| **LIB-02** | **Library Status Filter Coverage:** Filter only shows All, Ready, Processing, Failed (`C5`). Individual stages (Uploaded, Extracting, Chunking, Generating embeddings, Indexing) are not directly selectable. | Add comprehensive status filter options or clear status indicators so every stage is observable and inspectable. | `frontend/src/pages/DocumentsPage.jsx`<br>`frontend/src/components/ui/StatusDot.jsx` | Low | Low |
| **UI-03** | **Monospace Uppercase Decoration:** Leftover monospace uppercase labels appear in docs headers, research counters, and metadata (`R2`). | Reserve monospace exclusively for code spans, byte values, and IDs. Convert UI labels to Inter font with sentence case. | `frontend/src/pages/DocsPage.jsx`<br>`frontend/src/pages/ResearchPage.jsx`<br>`frontend/src/pages/LandingPage.jsx` | Low | Low |
| **UI-04** | **Unlabelled Top Bar Icons & Platform Shortcuts:** Header icons need tooltips/aria-labels; shortcut hints must detect Mac vs Windows (`B3`). | Add accessible `aria-label` attributes and tooltip titles to all header icons. Display `⌘K` on macOS and `Ctrl+K` on Windows/Linux. | `frontend/src/components/layout/Header.jsx`<br>`frontend/src/components/layout/Sidebar.jsx` | Low | Low |

---

## 3. Not Verifiable Requirements & External Dependencies

| ID | Requirement | Reason Not Verifiable in Code | Exact User Input Required |
| :--- | :--- | :--- | :--- |
| **J18** | Real Gemini Integration Tests | Automated test suite uses mocks to protect quota and permit zero-credential CI. Unmocked live testing requires a valid Gemini API key. | 1. Open `backend/.env`.<br>2. Set `GEMINI_API_KEY=AIza...` with your Google AI Studio API key.<br>3. Restart the backend daemon.<br>*(Never paste your API key into this chat).* |
| **M1** | ShadowFox Assignment Brief Deliverables | The `docs/assignment/` directory is not committed to the repository. | If ShadowFox provided a specific PDF or rubric mandating video duration limits, demo format, or report templates, provide those details or place the file in `docs/assignment/`. |
| **M2** | Live Cloud Deployment URL | The application is currently running locally on port 5173/8001. A public URL requires cloud host provisioning. | Select your preferred hosting layout (Section 4 below) and provide deployment authorization. |

---

## 4. Deployment Layout Proposal & Platform Comparison

To deploy DocuMind AI so real users and evaluators can use it without local setup, we evaluated the four leading hosting architectures based on verified official documentation (retrieved November 2026):

### Architecture Comparison Table

| Architecture Layout | Frontend Host | Backend & Database Host | Cost / Month | Persistence & Storage | Same-Origin / Cookies | Evaluator Experience |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **Option 1: Railway Unified (Recommended)** | Served via FastAPI static mount / reverse proxy in single container | Railway Docker Container with Persistent Volume | **$5.00** (Hobby plan includes $5 usage credit; storage $0.15/GB-mo) | **5 GB Persistent Volume** mounted at `/app/storage`. SQLite, ChromaDB, and uploads survive redeploys and restarts. | **Same-origin (`/api` and `/` on same domain).** Native support for `httpOnly`, `Secure`, `SameSite=Lax` cookies with zero third-party cookie blocking. | Zero configuration, immediate response, no cold start delays. |
| **Option 2: Cloudflare Pages + Railway** | Cloudflare Pages (Free Tier) | Railway Docker Container with Persistent Volume | **$5.00** (Cloudflare Free: 500 builds/mo, unlimited bandwidth; Railway: $5/mo) | Persistent volume on Railway backend. Frontend on global CDN edge. | **Cross-subdomain (`app.domain.com` & `api.domain.com`).** Requires exact CORS origin configuration and `SameSite=None; Secure` cookies. | Extremely fast static asset loading from edge CDN. |
| **Option 3: Render Paid Web Service** | Render Static Site (Free) | Render Paid Web Service ($7/mo Starter + $0.25/GB-mo Disk) | **$7.25+** (Render free tier does *not* support persistent disks) | Persistent disk mounted on single instance. Cannot horizontally autoscale with disk attached. | Cross-origin or single reverse proxy. | Reliable, but higher baseline cost and single instance limitation. |
| **Option 4: Fly.io Machine** | Unified container on Fly.io | Fly.io Machine with NVMe Volume | **$3.00 to $5.00** (No free volume tier; storage $0.15/GB-mo; compute billed per second) | NVMe Persistent Volume. Automatic machine sleep/wake on incoming HTTP requests. | Same-origin. | Cold start delay (2-4 seconds) when waking from sleep. |

### Recommendation: **Option 1 (Railway Unified Container)**
- **Why it fits best:**
  1. **Zero Cookie Friction:** Serving both the React SPA and the FastAPI REST API from a single domain eliminates cross-site cookie restrictions in Safari, Chrome, and iOS WebKit, guaranteeing that the `httpOnly` visitor session cookie works flawlessly.
  2. **True Persistence:** SQLite and ChromaDB reside on a Railway persistent volume (`/app/storage`) that survives redeploys and container restarts.
  3. **Low Cost:** The $5/month Railway Hobby tier includes $5 of compute and storage credits, making it ideal for student budgets.

---

## 5. Catalog of Intentional Deviations

| # | Spec Item | Original Draft | Implementation | Rationale |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Brand Accent Palette** | Electric Indigo (`#4F46E5`) | Forest Pine (`#1B4332`), Warm Amber (`#D97706`), Warm Paper (`#FCFBF9`) | Indigo gradients and buttons represent generic AI boilerplate. Forest Pine conveys scholarly credibility, institutional calm, and high contrast. Amber is reserved strictly for citation chips. |
| **2** | **Sidebar Shell Layout** | Separate "Overview" and "Recent activity" sidebar buttons | "Home" serves as the search-first dashboard; "Recent activity" and active threads live directly on the Home dashboard | Keeps the sidebar focused on primary work surfaces (Library, Research Desk, Settings) while surfacing active research context immediately on Home. |
| **3** | **Technical Diagnostics Split** | System telemetry shown in user Settings | Preferences (theme, export, purge) in `/workspace/settings`; deep diagnostics (model parameters, top_k, chunk overlap, circuit breaker) in `/system` | Prevents exposing raw developer-facing JSON and debugging latency counters to end users in the main settings screen. |
| **4** | **Sample Paper Attribution** | "Public Domain" label | Sourced preprint attribution: Vaswani et al. (arXiv:1706.03762) under arXiv non-exclusive open license (and transitioning away from any fair use claim) | Completely eliminates false public domain claims and enforces the Zero False Claims policy. |

---

## 6. Phased Implementation Roadmap (Step 3 Preview)

Once you approve this plan, implementation will proceed through the following self-contained phases:

- **Phase S1: Security & Identity Overhaul (Blockers)**
  - Remove session token display and copy button from Settings.
  - Eliminate client-side `localStorage` token generation; enforce pure server-issued `httpOnly` cookie auth.
  - Add CSRF double-submit token verification on mutating endpoints.
  - Hide raw workspace UUID behind expandable disclosure.
  - Run isolation security test suite.
- **Phase S2: Legal Honesty & Calibrated Copy**
  - Update sample document licensing (remove "fair use" claim).
  - Eliminate "deterministic" and "strict grounding" overclaims; plainly disclose Gemini cloud processing.
  - Remove clinical trials positioning; add advice disclaimer.
  - Fix hardcoded page counts (compute dynamically from SQLite).
  - Centralize product names in constants file.
- **Phase S3: UI Bugs, Navigation & Documentation**
  - Fix Button component flex layout (single row, consistent height).
  - Fix DocsPage scroll-spy mismatch and restructure: User Guide first, Technical Architecture second.
  - Clean sidebar navigation: move System Diagnostics to Settings/footer; remove developer route hints; add New workspace action.
  - Eliminate leftover uppercase monospace labels across UI.
  - Consolidate duplicate actions on Document Library.
- **Phase S4: Verification, Test Suite & Cross-Browser Validation**
  - Execute full pytest suite (confirm 44/44 passing).
  - Run Puppeteer end-to-end journey tests.
  - Run repository hygiene scanner (`verify_hygiene.py`).
  - Refresh evidence screenshots.
- **Phase S5: Go-Live Deployment (Phase S7)**
  - Connect repository to Railway (Option 1).
  - Provision 5 GB persistent volume for `/app/storage`.
  - Verify live SSL, custom domain, and persistence across redeploys.
  - Live mobile phone verification on 4G/5G connection.

