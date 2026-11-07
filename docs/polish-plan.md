# DocuMind AI: Comprehensive Polish and Production Launch Plan

**Document:** `docs/polish-plan.md`  
**Date:** November 2026  
**Auditor Roles:** Principal Product Designer, Senior Frontend Engineer, UX Writer, Release Engineer  
**Status:** Awaiting User Approval  

---

## 1. Executive Overview

This plan defines the concrete architectural, visual, copy, and operational transformations required to advance DocuMind AI into a commercially credible, authentic research platform. Every proposed change is grounded in the findings of the Audit (`docs/polish-audit.md`) and the empirical patterns of our Reference Product Study (`docs/polish-research.md`).

Following user approval, execution will proceed through sequential phases with verified browser and command output at each milestone.

---

## 2. Detailed Component and Surface Plans

### 2.1 Landing Page (`/`)

#### Structure
- **Left-Aligned Two-Column Hero:** 
  - Left column: High-contrast headline, one plain-language sentence explaining the core benefit, and two prominent actions: `"Open research workspace"` (primary) and `"Try with a sample document"` (secondary).
  - Right column: A live, interactive onboarding widget. Users can drag and drop a PDF file or click a one-click sample question directly on the landing page. Interacting initiates real session creation, triggers the live ingestion pipeline, and transitions cleanly into the research workspace.
- **Header Navigation:** Clean, unpretentious public navigation:
  - Brand Wordmark (SVG)
  - `"How it works"` (smooth scroll to explanation section)
  - `"Privacy & Retention"` (links to `/privacy`)
  - `"Documentation"` (links to `/docs`)
  - `"GitHub"` (repository link)
  - `"Open workspace"` (button CTA)
  - *Removed:* `"Settings"`, `"Pipeline Architecture"`, `"Comparison Matrix"`.
- **Planned Narrative Sections:**
  1. **Hero with Live Onboarding Widget:** Zero fake pill badges; live pipeline connectivity indicator only when degraded.
  2. **How it works (4 Steps with Genuine Screenshots):** 
     - Step 1: Ingest (PDF / TXT with page-bounded extraction).
     - Step 2: Index (dense vector embeddings persisted on disk).
     - Step 3: Query (semantic retrieval with similarity scoring).
     - Step 4: Verify (server-side citation checks against real source passages).
  3. **Check Every Answer (The Core Differentiator):** Large genuine screenshot showing an inline citation chip opening the exact page with the passage highlighted. Plain explanation of how server-side validation strips hallucinated references before rendering.
  4. **Multi-Document Synthesis:** Real screenshot showing answers synthesizing knowledge across multiple simultaneous sources.
  5. **What It Can and Cannot Do (Honest Limits):** 
     - Supports PDF and plain text documents up to 20 MB and 50 pages per file.
     - Scanned image PDFs without OCR text layers are not currently indexed.
     - Answers are generated from retrieved context and may contain errors. Citations should always be checked against the source.
  6. **Your Documents and Privacy:**
     - Data is strictly isolated by cryptographic visitor session tokens.
     - All documents, vectors, and chats are automatically purged after 7 days of inactivity (configurable).
     - Text is processed securely via the Google Gemini API solely for embeddings and answers; files are never used to train public models.
     - One-click `"Delete all my data"` available anytime in Settings.
  7. **Frequently Asked Questions (FAQ):** Accordion addressing common inquiries (cost, file types, citation accuracy, data retention).
  8. **Footer:** Comprehensive links to Documentation, Privacy Policy, Terms of Service, Technical Details, Feedback, and GitHub.

#### Headline Direction
- **Option 1 (Recommended):** *"Ask your documents. See the page that answers."*  
  *(Why: Concrete, active, immediately explains the product in plain words without jargon.)*
- **Option 2:** *"Get answers from your PDFs, with the page to check."*  
  *(Why: Clear and friendly, emphasizing source verification.)*
- **Option 3:** *"Read documents faster. Verify every answer at the source."*  
  *(Why: Professional and outcome-oriented for researchers and knowledge workers.)*

---

### 2.2 Upload Desk and Workspace Home (`/workspace`)

- **Full-Width Calm Drop Surface:** Replace the generic dashed box with a full-width bordered panel styled in Warm Paper surface tones (`bg-surface`, `border-border`). Active drag events over the window trigger a full-screen subtle overlay with the label `"Drop PDF or text files to add to your workspace"`.
- **Dynamic Configuration Telemetry:** Upload limits are read directly from `GET /api/config` and formatted in friendly units: `"Accepts PDF and TXT files up to 20 MB and 50 pages per document."`
- **Single Action Hierarchy:**
  - Primary button: `"Add documents"` (triggers file picker).
  - Secondary button: `"Try a sample document"` (ingests Vaswani et al. 2017 with accurate scholarly fair-use attribution).
- **First-Time vs Returning States:**
  - *First-time user:* A clean 3-step checklist: 1. Add your research document, 2. Wait for indexing, 3. Ask your first question.
  - *Returning user:* Search-first dashboard: prominent search bar, recent sources list with processing statuses, and quick shortcuts to prior conversation threads.
- **Streamlined Workspace Concept:** For single-workspace visitors, hide the workspace selector dropdown from the primary navigation bar. Move workspace management exclusively to Settings.

---

### 2.3 Document Library Table (`/workspace/documents`)

- **Calm Density Property Table:** 
  - Columns: Name (with file type icon), Status (`StatusDot` with plain label: `Ready`, `Indexing`, `Failed`), Pages, Size, Upload Date, Actions.
  - Sizing: Compact 38px row height with 12px horizontal cell padding.
  - Numbers: Formatted with `font-variant-numeric: tabular-nums` to prevent visual jitter.
  - Pipeline feedback: Processing documents show real-time stage inline (`Extracting`, `Chunking`, `Embedding`, `Indexing`). Failed documents show the actual error reason with an immediate `"Retry"` button.
- **Row Hover & Bulk Trays:** Action buttons (`Inspect`, `Download`, `Delete`) appear cleanly on row hover. Multi-selection triggers a floating batch action tray for batch deletion.

---

### 2.4 Research Workspace Desk (`/workspace/research`)

- **Adaptive 3-Zone Layout:**
  - **Zone 1 (Sources Rail, Left):** Collapsible scoping panel showing active documents with checkboxes, page counts, and a clear document count pill (`2 of 3 sources active`).
  - **Zone 2 (Conversation Canvas, Center):** 
    - Answer body typeset in `Source Serif 4` (15px, `leading-relaxed`) on the clean canvas background.
    - Inline citation chips rendered in Forest Pine / Warm Ember: clicking a chip opens the evidence inspector and scrolls to the highlighted excerpt.
    - A clean `"Sources"` card footer beneath every assistant message listing the exact document titles and pages referenced.
  - **Zone 3 (Evidence Inspector, Right):** **Collapsed by default** on initial load or empty sessions. Automatically slides open (200ms ease-out) when a user clicks a citation marker `[1]` or when manually opened via the top evidence toggle. Features two tabs: *Passages* (scrollable verified chunks) and *Document Page* (embedded PDF reader page view).
- **Composer Fixes:**
  - Fix flex alignment on the Send button so the icon and label remain horizontally aligned (`inline-flex items-center gap-2`) with proper disabled opacity.
  - Add a live `"Stop generating"` button while streaming SSE responses.
- **Real Suggested Questions:** Fetches 3 grounded question suggestions from `POST /api/chat/suggested-questions` based on selected documents, displayed as clickable prompt pills.
- **Insufficient-Evidence State:** Designed refusal state when context relevance falls below threshold: *"The selected documents do not contain enough evidence to answer this question. Try selecting additional documents or refining your inquiry."*

---

### 2.5 Settings & System Pages Split

- **User Settings (`/workspace/settings`):**
  - Runs inside the persistent `WorkspaceLayout` shell with the standard navigation sidebar.
  - Sections:
    1. **Appearance:** Theme toggle with three plain options: `Light`, `Dark`, and `System`.
    2. **Active Workspace:** Workspace name, document count, and session identifier.
    3. **Data and Privacy:** 
       - Information callout stating the active 7-day retention period.
       - `"Export all my data"` button (downloads `.zip` archive).
       - `"Delete all my data"` button (with confirmation modal).
    4. **Keyboard Shortcuts:** Quick reference list for `⌘K` / `Ctrl+K`, Enter, and Escape.
- **Technical Details Page (`/system`):**
  - Dedicated page linked from the footer and documentation for developers, evaluators, and auditors.
  - Displays dynamic runtime telemetry from `GET /api/ready` and `GET /api/config`: active models (`gemini-2.5-flash`, `gemini-embedding-001`), chunk size, overlap, similarity threshold, database engine (SQLite), vector store engine (ChromaDB), free disk space, and operational uptime.

---

## 3. Comprehensive UX Copy Deck (Old vs. New)

This copy deck eliminates academic jargon, robotic AI phrasing, false claims, and decorative embellishments across all surfaces.

| Surface / Area | Original String | Polished Replacement | Rationale |
| :--- | :--- | :--- | :--- |
| **Landing Hero** | `"Verifiable Document Research Desk"` | `"Ask your documents. See the page that answers."` | Replaces abstract category label with direct user outcome. |
| **Landing Hero Subhead** | `"Ground research strictly across your uploaded PDF and text documents. Every assertion cites exact pages and passages verified server-side against stored chunks, stripping hallucinated references before they reach your screen."` | `"Upload your research papers and PDFs. Get clear answers backed by exact paragraph citations you can click and verify on the page."` | Converts intimidating pipeline jargon into one natural, human sentence. |
| **Landing Badge** | `"System Online: Verified RAG Active"` *(Static pill badge)* | *(Removed entirely)* | Eliminates deceptive static status badge. |
| **Landing CTA 1** | `"Open Research Workspace"` | `"Open workspace"` | Direct and standard. |
| **Landing CTA 2** | `"Load Sample Paper (Attention Is All You Need)"` | `"Try a sample document"` | Eliminates cluttered parenthetical string. |
| **Public Navigation** | `"Pipeline Architecture"`, `"Comparison Matrix"`, `"Settings"` | `"How it works"`, `"Privacy"`, `"Documentation"` | Removes internal development artifact links. |
| **Sample Paper Attribution** | `"PUBLIC DOMAIN"` | `"arXiv:1706.03762 (Vaswani et al.). Educational demonstration."` | Resolves legally inaccurate copyright claim. |
| **Home Search** | `"Quick search documents, chunks, or ask a question..."` | `"Search documents or type a question..."` | Removes developer term "chunks". |
| **Home Upload Heading** | `"Upload Research Documents"` | `"Add documents"` | Simple, standard imperative. |
| **Home Upload Subtext** | `"Drag and drop PDF or TXT files here, or click to browse. Max 20 MB per file."` | `"Drop PDF or text files here, or browse. Up to 20 MB and 50 pages per document."` | Clear limits read from dynamic configuration. |
| **Research Empty State** | `"Grounded Document Research Desk. Scoped to 0 of 0 document(s). (Press Enter to submit)"` | `"Ask a question about your documents. Select documents on the left to begin your research."` | Eliminates robotic repetition and stacked notes. |
| **Research Suggestions** | `"Suggested inquiries from active scope"` | `"Questions you could ask"` | Conversational, natural register. |
| **Research Composer Hint** | `"Press Enter to submit, Shift+Enter for new line"` | `"Press Enter to send, Shift+Enter for a new line"` | Standard messaging interaction hint. |
| **Research Refusal** | `"Insufficient context in indexed documents to answer the inquiry with calibrated confidence."` | `"The selected documents do not contain enough evidence to answer this question."` | Plain, clear, respectful language. |
| **Settings Theme** | `"Warm Paper (Light)"`, `"Charcoal Ink (Dark)"`, `"desk lighting"` | `"Light"`, `"Dark"`, `"System"` | Standard, clear visual preferences. |
| **Settings Metrics** | `"20 MB (2,09,71,520 bytes)"` | `"20 MB"` | Eliminates raw byte clutter. |
| **Settings Status** | `"Ready Healthy"` | `"Operational"` | Single unambiguous status word. |
| **Settings Retention** | `"Session Data Retention: 7 Days"` | `"Your documents and chats are kept for 7 days, then automatically deleted."` | Explains the real retention behavior in plain terms. |

---

## 4. Visual Craft, Tokens & Component Specifications

- **Spacing System:** Strict 4px and 8px base modular rhythm (`space-y-1`, `space-y-2`, `space-y-4`, `space-y-6`, `space-y-8`, `space-y-12`).
- **Typography Pairing:**
  - **Headings & UI:** `Inter` (`font-medium` for section titles, `font-semibold` for headers).
  - **Extended Reading & AI Answers:** `Source Serif 4` (`font-normal`, 15px, `leading-relaxed`, reading measure max 68ch).
  - **Code, Bytes & Identifiers:** `JetBrains Mono` (strictly reserved for code snippets, API paths, and technical IDs).
  - **Numeric Data:** `tabular-nums` applied across all table numbers, dates, and file sizes.
- **Palette Roles:**
  - `Canvas`: `#FBF9F5` (Warm Paper Light) / `#0C0D0E` (Charcoal Ink Dark).
  - `Surface`: `#FFFFFF` (Light) / `#141517` (Dark).
  - `Border`: `#E8E5DF` (Light) / `#232528` (Dark).
  - `Forest Pine Accent`: `#1B4332` (Light) / `#2D6A4F` (Dark) for primary action buttons, active sidebar indicators, and focus rings.
  - `Warm Ember Accent`: `#9C381E` (Light) / `#D97706` (Dark) strictly for inline citation chips `[1]` and excerpt highlights.
- **Corner Radii Hierarchy:** Restrained commercial radii: 4px (`rounded`), 6px (`rounded-md` on buttons and cards), 8px (`rounded-lg` on modals and upload zones). Zero pill-shaped buttons.
- **Transitions and Motion:**
  - Button and link hovers: 150ms ease-out.
  - Panel slide-over (evidence drawer): 200ms `cubic-bezier(0.16, 1, 0.3, 1)`.
  - Passage highlight arrival: 400ms fade-in.
  - Reduced-motion queries respected via `motion-reduce:transition-none`.

---

## 5. Production Go-Live & Cloud Hosting Plan

### 5.1 Recommended Architecture for Students
- **Unified Multi-Stage Docker Container on Railway or Render:**
  - Multi-stage build compiles the Vite React SPA and packages it into FastAPI static file serving.
  - A single persistent volume mounted at `/app/storage` holds the SQLite database (`storage/documind.db`), ChromaDB vector store (`storage/chroma`), and uploaded files (`storage/uploads`).
  - Single domain prevents all cross-origin CORS complications and egress charges.
- **Cost Analysis (Verified Official Pricing):**
  - **Hosting:** Railway Hobby Plan ($5/mo credit included, persistent disk $0.25/GB/mo) or Render Starter ($7/mo + disk).
  - **Gemini API:** Free tier (15 RPM, 1,500 RPD) completely free of charge. Pay-as-you-go costs $0.075 / 1M input tokens. A live student demo processing 500 documents costs less than $0.25/month.
  - **Custom Domain:** Existing user domain with DNS CNAME record pointing to the hosting container.

### 5.2 Environment Variable Matrix
| Key | Required | Value / Default | Purpose |
| :--- | :--- | :--- | :--- |
| `GOOGLE_API_KEY` | **Yes** | User AI Studio Key | Powers embedding generation and grounded answers. |
| `SESSION_SECRET` | **Yes** | 64-char hex string | Cryptographically signs session cookies. |
| `ENVIRONMENT` | No | `production` | Enforces production logging and error sanitization. |
| `DATA_RETENTION_DAYS` | No | `7` | Days before inactive workspaces are purged by the reaper. |
| `ALLOWED_ORIGINS` | No | `*` | Allowed CORS origins. |
| `SQLITE_DB_PATH` | No | `storage/documind.db` | Persistent SQLite location. |
| `CHROMA_DIR` | No | `storage/chroma` | Persistent ChromaDB vector location. |

### 5.3 Rollback and Disaster Recovery Plan
- Storage directory snapshotting via `tar -czvf backup.tar.gz ./storage`.
- Git commit pinning in CI/CD pipeline ensuring instant rollbacks via `git revert`.

---

## 6. Implementation Phasing Strategy

Upon approval of this plan, execution will occur in five sequential phases, stopping after each with verified test reports:

- **Phase P1 (Copy, Information Architecture & Landing Page):**
  - Apply the comprehensive copy deck across all components.
  - Build the asymmetric editorial landing page with the live interactive hero onboarding widget.
  - Build the 4-step "How it works" and honest limits sections with genuine screenshots.
  - Streamline public navigation and footer.
- **Phase P2 (Workspace Shell, Home, Library & Settings Split):**
  - Redesign the upload desk into a calm, full-width bordered panel with full-page drag overlay.
  - Fix duplicate buttons and search inputs.
  - Implement platform-aware shortcut detection (`⌘K` vs `Ctrl+K`).
  - Fix the sample paper attribution for Vaswani et al. (2017).
  - Split user settings (`/settings`) from technical system diagnostics (`/system`).
- **Phase P3 (Research Workspace Desk Polish):**
  - Implement default-collapsed right evidence drawer that slides open on citation click.
  - Fix composer Send button flex alignment and disabled states.
  - Add streaming stop button and suggested question chips.
  - Polish the insufficient-evidence refusal state.
- **Phase P4 (Brand, Visual Craft & Dark Theme):**
  - Refine SVG BrandMark and Wordmark for authentic brand identity.
  - Audit focus rings, hover states, tabular numerals, and selection colors.
  - Complete dark theme visual balance pass.
- **Phase P5 (Verification, E2E Testing & Go-Live Readiness):**
  - Run full Puppeteer end-to-end journey tests.
  - Run WCAG 2.1 AA accessibility audit (`axe-core`).
  - Run 43 backend tests.
  - Run security and hygiene scans.
  - Provide live deployment execution runbook.
