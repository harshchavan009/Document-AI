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



