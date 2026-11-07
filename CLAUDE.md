# CLAUDE.md: Project Memory and Guidelines for DocuMind AI

## 1. Product Summary
- **Product Name:** DocuMind AI
- **Category:** AI-Powered Document Intelligence Platform
- **Tagline:** Your documents. Understood intelligently.
- **Description:** DocuMind AI is an intelligent document research and question-answering platform. Users upload documents (PDF, TXT), the system extracts and indexes their knowledge, and users receive AI-generated answers backed by real, inspectable source references from their own documents.
- **Audience:** Students, researchers, professionals, and knowledge workers who need to understand large documents without manually searching every page.
- **Experience Goal:** A premium research workspace, not a chatbot. It must feel like an engineered commercial product.

---

## 2. The "Never Do" List (Non-Negotiable Rules)

### 2.1 The Zero Static Data Rule
- Never display hardcoded numbers, statistics, counts, dates, statuses, names, documents, answers, or activities.
- No fake metrics, fake usage charts, fake activity feeds, fake "documents processed" counters, fake customer counts, fake testimonials, fake reviews, fake logos, fake pricing, fake latency numbers, or fake accuracy percentages.
- Counts (documents, chunks, pages, file sizes, dates, durations, relevance scores) must be computed from stored data and formatted at render time.
- Configuration values (chunk size, overlap, top_k, relevance threshold, max file size, allowed types, model names) live in backend configuration and are exposed to the frontend via `GET /api/config`. The frontend must read upload limits and allowed types from this endpoint.
- Every list, table, badge, and status must have an empty state, a loading state, and an error state driven by real conditions.

### 2.2 The "Not Generic, Not Vibe-Coded" Rule
- No purple or purple-to-blue gradients, glowing orbs, gradient text, or mesh gradient backgrounds.
- No pill-shaped (fully rounded) buttons. Use restrained corner radii (2px to 8px) across the whole system.
- No emoji used as icons anywhere. Use Lucide React icons consistently.
- No em dashes in any user-facing copy, documentation, or code comments. Use commas, colons, periods, or parentheses.
- No vague hero text ("Supercharge your workflow", "Unlock the power of AI", "Next-generation", "Revolutionize", "Seamless", "Effortless"). Every headline must state a concrete action the product performs.
- No AI-sounding filler copy, buzzword stacks, three-word slogan triplets, or repetitive feature cards with identical structure.
- No over-the-top scroll animations (parallax, scroll-jacking, staggered reveal on every element).
- No custom cursor effects or cursor-following animations.
- No AI-generated stock imagery, fake 3D renders, cartoon illustrations, or random decorative blobs.
- No oversized glowing cards, heavy glassmorphism, or repetitive rounded-card grids.
- No ChatGPT-clone layout for the research area.
- No default SaaS dashboard template look.
- The product preview on the landing page must be a faithful rendering of the real application UI built from the same components.

### 2.3 The Honesty Rule
- No mock AI responses, hardcoded answers, fake embeddings, fake vectors, simulated vector search, simulated progress, or simulated processing stages.
- Never fabricate page numbers, sources, or citations.
- Do not claim OCR unless OCR is actually implemented and verified.
- Do not claim security certifications (SOC 2, HIPAA, GDPR, ISO) or "enterprise-grade" status unless implemented and verified.
- Do not claim a test passed or an API call succeeded until actually run and verified with real command output.
- Do not assume an API key exists. Provide `.env.example` with clear instructions.

### 2.4 The "Every Control Works" Rule
- Every visible button, link, menu item, filter, and toggle must perform a real action wired to real logic.
- If a feature is not implemented, it must not appear in the interface.

---

## 3. Design Tokens Summary

- **Surfaces (Light):** Canvas `#FBFBFB`, Surface `#FFFFFF`, Surface Subtle `#F4F4F5`, Border `#E4E4E7`
- **Surfaces (Dark):** Canvas `#09090B`, Surface `#121215`, Surface Subtle `#18181B`, Border `#27272A`
- **Accent:** Electric Indigo `#4F46E5` (Light), `#6366F1` (Dark). Used only for active states, focus rings, primary action buttons, and verified citation links. Never as a gradient.
- **Typography:** Inter / system sans-serif for UI; Monospace (`ui-monospace`, `Menlo`, `Monaco`) for citations, code, and source metadata. Reading width max 68ch.
- **Corner Radii:** 2px (checkboxes, tags), 4px (badges, small inputs), 6px (buttons, cards, dropdowns), 8px (dialogs, upload zone). No pill buttons.
- **Borders:** 1px hairline borders for structural definition. Depth via surface luminance, not blurry shadows.

---

## 4. Folder Structure Plan

```
Document-AI/
├── CLAUDE.md
├── PROJECT_BRIEF.md
├── .gitignore
├── docs/
│   ├── architecture.md
│   ├── design-research.md
│   ├── design-system.md
│   ├── rag-workflow.md
│   ├── api-documentation.md
│   ├── retrieval-evaluation.md
│   └── security-review.md
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── api/
│   │   │   ├── health.py
│   │   │   ├── config.py
│   │   │   ├── documents.py
│   │   │   ├── chat.py
│   │   │   └── workspaces.py
│   │   ├── services/
│   │   │   ├── document_service.py
│   │   │   ├── extraction_service.py
│   │   │   ├── chunking_service.py
│   │   │   ├── embedding_service.py
│   │   │   ├── vector_store.py
│   │   │   ├── retrieval_service.py
│   │   │   ├── rag_service.py
│   │   │   └── job_service.py
│   │   ├── prompts/
│   │   │   └── rag_prompts.py
│   │   └── utils/
│   │       ├── validation.py
│   │       ├── file_utils.py
│   │       └── security.py
│   ├── storage/
│   │   ├── uploads/
│   │   └── chroma/
│   ├── tests/
│   │   ├── test_upload.py
│   │   ├── test_extraction.py
│   │   ├── test_chunking.py
│   │   ├── test_retrieval.py
│   │   ├── test_rag.py
│   │   └── test_security.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── api/
    │   │   └── client.js
    │   ├── components/
    │   │   ├── ui/
    │   │   ├── layout/
    │   │   ├── documents/
    │   │   └── research/
    │   ├── context/
    │   │   ├── ThemeContext.jsx
    │   │   └── WorkspaceContext.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── WorkspacePage.jsx
    │   │   ├── DocumentsPage.jsx
    │   │   ├── ResearchPage.jsx
    │   │   ├── PrivacyPage.jsx
    │   │   ├── TermsPage.jsx
    │   │   ├── DocsPage.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 5. Development and Test Commands

### Backend
- Virtual Environment: `python3 -m venv .venv && source .venv/bin/activate`
- Install Dependencies: `pip install -r backend/requirements.txt`
- Run Server: `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload`
- Run Tests: `pytest backend/tests -v`
- Dependency Audit: `pip-audit`

### Frontend
- Install Dependencies: `cd frontend && npm install`
- Run Development Server: `npm run dev`
- Production Build: `npm run build`
- Run Linting: `npm run lint`

---

## 6. Current Phase Status
- **Current Phase:** COMPLETE (All Phases 1 through 6 Finalized)
- **Phase 1 (Research & Design):** Complete. Design system, architecture, API specs, and RAG workflow authored in `docs/`.
- **Phase 2 (Backend Implementation):** Complete. FastAPI backend, PyMuPDF extraction, ChromaDB vector store, Google Gen AI SDK embedding/generation, SSE streaming.
- **Phase 3 (Frontend Implementation):** Complete. React 18 + Vite SPA, editorial design system, PDF.js preview modal, citation chips, responsive viewports.
- **Phase 4 (System Integration):** Complete. Live client-server integration verified, 23 automated tests passing, end-to-end ingestion and chat validated.
- **Phase 5 (QA & Security Auditing):** Complete. Dependency audits documented, secret scan passed, retrieval calibration evaluated, security review published.
- **Phase 6 (Documentation & Deployment):** Complete. Production `README.md`, genuine headless Chrome screenshots (`docs/screenshots/`), deployment guide, and internship evaluation summary finalized.
- **Redesign Phase R1 (Foundations):** Complete. Implemented Forest Pine and Warm Ember tokens, self-hosted Source Serif 4 and Inter typography, original SVG BrandMark and Wordmark, base components (Button, IconButton, StatusDot, CitationMarker, EvidenceExcerpt, SourceCard, EmptyState, CommandPalette), and `/design-system` showcase route. Verified with 23 backend tests and full frontend build.
- **Redesign Phase R2 (App Shell, Home, Library):** Complete. Implemented search-first Workspace Home (Dropbox Dash / Perplexity style) replacing 4-up stat cards, purposeful onboarding empty desk with live `/api/config` limits and sample paper ingestion, Notion-style property table for Document Library with sorting, filtering, and bulk actions, floating `UploadTray` with byte progress, and full-window drag-and-drop backdrop. Backend `POST /api/documents/sample` added and verified. All 24 backend tests passing.
- **Launch Step 1 & Step 2 (Audit & Plan):** Complete. Comprehensive live audit in `docs/launch-audit.md` with 60 screenshots across 10 routes in both themes; attack script in `docs/scripts/audit_suite.py`; architecture and launch plan in `docs/launch-plan.md`.
- **Launch Phase L1 (Blockers):** Complete. Multi-tenant session isolation enforced across all document and chat endpoints (DEF-01 fixed with 100% 404 blocks on cross-tenant requests); slowapi rate limiting installed on upload, sample ingest, and query endpoints; 50-page PDF limit enforced upfront and in ExtractionService; calibrated docstrings in RAG and session middleware; dynamic file accept bindings; 10 new security tests in `test_isolation_security.py` (35/35 passing); 0 build errors; 0 em dashes.
- **Launch Phase L2 (Reliability & Operations):** Complete. Startup orphan job recovery via `JobService.recover_orphan_jobs()` prevents stuck ingestion states; deep readiness probe `GET /api/ready` monitors DB, vector store, and disk space; Gemini circuit breaker trips on consecutive 429/503 errors and serves 503 with `Retry-After`; frontend cold-start detection and `ConnectionBanner`; production multi-stage `Dockerfile` and `docker-compose.yml` with persistent storage volume mapping; single-container SPA fallback in `main.py`. 39/39 backend tests passing; 0 build errors; 0 em dashes.
- **Launch Phase L3 (Trust, Transparency & Lifecycle):** Complete. Configurable data retention (`DATA_RETENTION_DAYS`, default 7) exposed via `/api/config`; startup retention reaper `purge_expired_workspaces()`; user-initiated session purge (`DELETE /api/workspaces/purge-session`) removing SQLite records, uploaded files, and ChromaDB vector embeddings with fresh session cookie issuance; in-memory data export (`GET /api/workspaces/export-session`) streaming ZIP archive containing documents, JSON conversation transcripts with citations, and manifest.json; user feedback model and endpoint (`POST /api/feedback`); frontend `FeedbackModal` accessible from Header and Settings; Settings page updated with Data Retention notice, Export, and Delete confirmation modal; calibrated Privacy Policy and Terms of Service. 43/43 backend tests passing; 0 build errors; 0 em dashes.
- **Launch Phase L4 (SEO, Discovery & CI Polish):** Complete. Implemented search engine discoverability assets (`robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`); OpenGraph, Twitter card metadata, and schema.org WebApplication JSON-LD in `index.html`; genuine 1200x630 social preview card (`og-image.png`); route-level dynamic titles and descriptions via `usePageMeta` hook; automated repo hygiene script (`scripts/verify_hygiene.py`) enforcing zero em dashes and zero committed API keys; GitHub Actions CI workflow (`.github/workflows/ci.yml`) covering hygiene, 43 backend pytest suites, and frontend production build. 43/43 tests passing; 0 build errors; 0 em dashes.
- **Polish Phase P1 (Copy, Information Architecture & Landing Page):** Complete. Implemented left-aligned two-column editorial hero with headline "Ask your documents. See the page that answers."; removed static status badge and assignment public navigation links; built live working interactive onboarding widget (`LandingTryWidget`) allowing direct document drop or sample inquiry with real pipeline progress; added 4-step "How it works", "Check every answer", multi-document synthesis, and honest limits sections with genuine screenshots (`/landing/...`); added real FAQ accordion and transparent footer; resolved Blocker AUD-15 by correcting sample paper copyright attribution to Vaswani et al. (2017) arXiv preprint with fair-use scholarly demonstration disclosures. All 43 backend tests passing; 0 build errors; 0 em dashes.
- **Polish Phase P2 (App Polish: Upload, Library, Shell, Shortcuts & Settings Split):** Complete. Implemented platform-aware keyboard shortcuts (`⌘K` vs `Ctrl+K`), accessible header tooltips and aria-labels, fixed active sidebar item border hairline artifact, removed duplicate search triggers, redesigned calm upload desk with dynamic limits from `/api/config`, added tabular-nums to Document Library table with inline failure retry, and cleanly split user settings (`/workspace/settings` inside workspace shell) from deep technical telemetry (`/system` diagnostics with live model IDs, chunk windows, cosine thresholds, loopback latency probe, and raw JSON payload inspector). All 43 backend tests passing; 0 build errors; 0 em dashes; 24 verification screenshots captured.
- **Polish Phase P3 (Research Workspace Desk Polish):** Complete. Refined the 3-zone research workspace desk: right evidence panel collapsed by default on empty research states and auto-expanded upon verified citations or citation footnote clicks; rewritten human-centered empty state copy ("Ask a question about your documents"); dynamic prompt cards for suggested inquiries without uppercase monospace decoration; natural composer placeholder and platform-aware shortcut footnote ("Press Enter to send, Shift+Enter for newline"); truthful refusal banner copy; left source scope panel with direct one-click sample document ingestion and add documents CTA when empty; verified footnote markers, source cards, and split PDF DocumentReader synchronizations. All 43 backend tests passing; 0 build errors; 0 em dashes; 6 multi-viewport verification screenshots captured.
- **Polish Phase P4 (Brand & Visual Craft):** Complete. Designed and integrated an authentic geometric vector brand mark evoking layered corpus document planes with a precision grounded citation aperture in Warm Ember; synchronized vector favicon (`favicon.svg`) and regenerated crisp raster touch/app icons (`apple-touch-icon.png`, `favicon-32x32.png`, `icon-192.png`, `icon-512.png`); verified WCAG 2.1 AA text contrast across both light (15.5:1 primary, 8.3:1 secondary, 5.8:1 muted) and dark palettes (14.6:1 primary, 8.0:1 secondary, 6.7:1 muted); unified focus rings (`ring-2 ring-accent/80 ring-offset-1`); verified smooth 150ms transitions and reduced-motion accessibility overrides; updated `/design-system` living showcase. All 43 backend tests passing; 0 build errors; 0 em dashes; 6 verification screenshots captured.
- **Polish Phase P5 (Final Verification, WCAG 2.1 AA Audit & Go-Live Preparation):** Complete. Executed automated axe-core accessibility audit across all 10 application routes achieving 0 serious/critical violations; verified production multi-stage Dockerfile and docker-compose.yml configuration with persistent volume mapping (`/app/storage`); verified 43/43 pytest suite; published comprehensive production deployment guide in `docs/launch-ready.md` covering Railway persistent volume deployment, environment variables, cost caps, and data lifecycle management. All Polish phases (P1 through P5) finalized. Zero em dashes.




