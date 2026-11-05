# Comprehensive UI/UX Redesign Brief: DocuMind AI

> **Document:** `docs/redesign-brief.md`  
> **Evaluation:** Intermediate-Level AI Engineer Internship Evaluation  
> **Author:** Principal Product Designer, Senior Frontend Engineer, UX Researcher, Accessibility Specialist  
> **Status:** Pending User Approval (Step 3 Deliverable)  
> **Implementation Phases:** R1 through R6 (Awaiting sign-off)

---

## 1. Product Concept: The Research Desk

DocuMind AI is conceived as a calm, tool-grade **research desk** designed for deep study, cross-document inquiry, and rigorous evidence verification. The physical metaphor is a **reading room**, not a mission control center.

### Core Principles
1. **The Document and Evidence are the Heroes:** Visual luminance and typographic clarity belong to the user's documents and cited excerpts. Chrome, panels, borders, and navigation remain restrained and neutral.
2. **Typeset Answers, Not Consumer Chat Bubbles:** Responses are rendered in an editorial reading column using high-legibility serif type, while retrieved evidence resides in visually distinct quoted paper surfaces with explicit document and page attribution.
3. **Provable Truth via Direct Interaction:** Citations are not passive footnotes. Hovering reveals the exact extracted passage; clicking opens the source document viewer to the exact page with the passage highlighted.
4. **Zero Static Data:** No hardcoded numbers, fake metrics, synthetic counters, or mock activity feeds. All counts and configuration values are queried live from SQLite, ChromaDB, and `GET /api/config`.
5. **Restraint Over Spectacle:** Zero purple gradients, glowing orbs, mesh backgrounds, pill buttons, floating glass cards, or decorative emojis.

---

## 2. Theme System and Color Architecture

### 2.1 Mode Philosophy
- **Light Theme (Default):** Warm paper neutral canvas (`#FBF9F5`), clean crisp card surfaces (`#FFFFFF`), warm subtle panels (`#F3F0EB`), and deep charcoal ink typography (`#1A1A1E`).
- **Dark Theme:** Grounded obsidian slate (`#0C0D0E`), elevated surface panels (`#141618`), subtle borders (`#22252A`), and soft ivory text (`#E6E8EC`). It is an intentionally engineered token set, not an algorithmic color inversion.
- **Theme Selection:** User-selectable (Light, Dark, System) and persisted in `localStorage`. First-time visits default to Light mode.

### 2.2 Brand Accent Proposals
Indigo and purple are strictly prohibited. Two authoritative, non-generic accent options are evaluated:

```
Option A: Forest Pine / Deep Emerald
  Light Mode: #1B4332 (Deep Forest Ink)
  Light Subtle: #EBF4EE (Soft Pine Tint)
  Dark Mode: #40916C (Muted Emerald)
  Dark Subtle: #132A1F (Dark Spruce Surface)
  Rationale: Reflects scholarly research, institutional credibility, and environmental calm. High contrast against paper surfaces.

Option B: Warm Ember / Terracotta
  Light Mode: #9C381E (Burnished Terracotta)
  Light Subtle: #FBF0EB (Warm Clay Wash)
  Dark Mode: #E26D4D (Muted Ember)
  Dark Subtle: #2E150F (Dark Rust Surface)
  Rationale: Echoes archival manuscript ink, highlighter ribbons, and physical bookbinding cloth. Exceptional warmth.
```

**Recommendation:** **Option A (Forest Pine)** as the primary brand accent for active states, focus rings, primary action buttons, and selection indicators. **Option B (Warm Ember)** is reserved specifically as a functional highlight color for citation marker chips (`[1]`, `[2]`) and text highlights on PDF pages. This separation ensures citation provenance stands out distinctly from standard interface navigation.

### 2.3 Semantic Color System
Semantic indicators are decoupled from brand accents:
- **Success:** `#15803D` (Text), `#DCFCE7` (Light Background), `#052E16` (Dark Background)
- **Warning:** `#B45309` (Text), `#FEF3C7` (Light Background), `#451A03` (Dark Background)
- **Error:** `#B91C1C` (Text), `#FEE2E2` (Light Background), `#450A0A` (Dark Background)
- **Info:** `#0369A1` (Text), `#E0F2FE` (Light Background), `#082F49` (Dark Background)

---

## 3. Typography Architecture

### 3.1 Font Pairing
- **Reading Serif (Answers & Document Excerpts):** **Source Serif 4** (Google / Adobe open source) self-hosted via `@fontsource/source-serif-4`. Delivers exceptional legibility, optical sizing, and an authentic editorial reading feel.
- **Interface Sans (Shell, Navigation, Controls, Tables):** **Inter Variable** (`@fontsource-variable/inter`). High structural clarity, neutral geometric curves, and optimized tabular number features (`tnum`).
- **Monospace (Code, Database IDs, API Specs only):** **JetBrains Mono** (`@fontsource/jetbrains-mono`) or system `ui-monospace`. Strictly prohibited for general UI labels, badges, or decoration.

### 3.2 Typographic Hierarchy
| Role | Font Family | Size | Weight | Line Height | Tracking | Use Case |
|---|---|---|---|---|---|---|
| **Display Hero** | Inter | 36px (2.25rem) | 700 (Bold) | 1.15 | -0.025em | Landing page headline |
| **Section Title** | Inter | 24px (1.5rem) | 600 (Semibold) | 1.25 | -0.02em | Page headers, modal titles |
| **Subsection** | Inter | 16px (1.0rem) | 600 (Semibold) | 1.35 | -0.015em | Panel headers, section dividers |
| **Body (Reading)** | Source Serif 4 | 15px (0.9375rem) | 400 (Regular) | 1.65 | 0.005em | AI answers, document summaries (65-72ch measure) |
| **Body (UI Sans)** | Inter | 13px (0.8125rem) | 400 (Regular) | 1.45 | 0.000em | Form inputs, descriptions, list rows |
| **UI Compact** | Inter | 12px (0.75rem) | 500 (Medium) | 1.40 | 0.005em | Table cells, buttons, sidebar items |
| **Caption / Meta** | Inter | 11px (0.6875rem) | 500 (Medium) | 1.35 | 0.010em | Timestamps, page numbers, status labels |
| **Citation Token** | Inter (Tabular) | 10px (0.625rem) | 700 (Bold) | 1.00 | 0.020em | Numbered citation chips `[1]`, `[2]` |
| **Code / Technical** | JetBrains Mono | 12px (0.75rem) | 400 (Regular) | 1.50 | 0.000em | API endpoints, JSON payloads, file hashes |

---

## 4. Brand Identity and Logo Design

### 4.1 Original Brand Mark (SVG)
The generic single-letter `D` in a rounded box is eliminated. The new brand mark represents **a document page with a folded corner interlaced with an open citation bracket**:

```
+-----------+  
|           |\  <-- Folded corner (document artifact)
|   [       | \ 
|           |--+
|   ]       |   <-- Citation bracket (grounded evidence)
|           |   
+-----------+   
```

- **SVG Specifications:** Clean vector geometry drawn on a 24x24 grid with a 1.5px stroke width. The stroke matches the primary brand accent (Forest Pine), with the citation bracket accented in Warm Ember.
- **Favicon Set:**
  - `favicon.svg` (SVG vector icon)
  - `favicon-32x32.png` (Retina web browser tab)
  - `apple-touch-icon.png` (180x180 iOS touch icon)
  - `icon-192.png` and `icon-512.png` (PWA maskable icons)
- **Open Graph Banner:** Dynamically rendered 1200x630 image displaying the actual DocuMind research desk with real citation markers.

### 4.2 Voice and Copy Guidelines
- Plain, direct, verb-first prose.
- Zero marketing jargon ("supercharge", "revolutionize", "seamless", "next-generation", "effortless").
- Zero em dashes (Unicode U+2014 or double hyphens) anywhere in user-facing copy, docs, or code comments. Use commas, colons, periods, or parentheses.
- Calibrated honesty: Citations are described as *verified against retrieved chunks*, never as *guaranteed 100% correct*.

### 4.3 Hero Headline Options
1. **Option 1 (Recommended):** *"Ask questions. Read answers backed by the exact pages they came from."*
2. **Option 2:** *"Document research grounded in your actual files, with page-level citations."*
3. **Option 3:** *"Turn complex documents into verifiable answers you can audit page by page."*

*Recommendation:* **Option 1**. It is concrete, verb-first, and clearly states what the product does.

---

## 5. Motion and Interaction Physics

### 5.1 Standards
- **Duration:** 120ms to 200ms.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (snappy ease-out).
- **Accessibility:** `@media (prefers-reduced-motion: reduce)` disables all transforms and replaces transitions with instantaneous opacity changes.
- **Prohibited:** Parallax, cursor-tracking elements, staggered reveals on scroll, infinite glowing loops.

### 5.2 Signature Interaction
**Citation-to-Passage Highlight:** When a user hovers or clicks an inline citation marker `[1]`, a 1px connector line briefly highlights from the citation chip to the corresponding passage card in the Evidence panel, accompanied by a single soft pulse on the target excerpt.

---

## 6. Screen-by-Screen Architectural Wireframes

### 6.1 Landing Page (`/`)
An editorial two-column layout that replaces the centered template:

```
+----------------------------------------------------------------------------------------------------+
| [Brand Mark] DocuMind AI      Product   How it Works   Security & Privacy   Docs    [Open Workspace] |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
| [LEFT COLUMN: 55%]                                   [RIGHT COLUMN: 45%: WORKING INTERACTION]      |
|                                                                                                    |
| Ask questions. Read answers backed by                 +------------------------------------------+ |
| the exact pages they came from.                       | LIVE DOCUMENT DROP ZONE                  | |
|                                                       | Drag a PDF or TXT to start researching   | |
| DocuMind AI indexes your multi-page documents and     | Limits: 25 MB max (from /api/config)     | |
| streams answers with inspectable source citations     | [Select File from Computer]              | |
| tied to real pages. No fabricated claims.             +------------------------------------------+ |
|                                                       | -- or try instantly with a sample --     | |
| [Get Started with Your Documents]                     | [Load "Attention Is All You Need" (PDF)] | |
|                                                       +------------------------------------------+ |
|                                                       | Natural language question:               | |
|                                                       | [What is multi-head attention?     ][->] | |
|                                                       +------------------------------------------+ |
|                                                                                                    |
|----------------------------------------------------------------------------------------------------|
| HOW IT WORKS: VERIFIED STEP SEQUENCE (Real App Screenshots)                                        |
| [1. Ingest & Chunk] --------> [2. Dense Retrieval] ---------> [3. Verified Citations]               |
| Real extraction screenshot     ChromaDB cosine threshold       Side-by-side passage highlight      |
|                                                                                                    |
|----------------------------------------------------------------------------------------------------|
| EDITORIAL FEATURE SECTIONS (Asymmetric Rows with Real Screenshots)                                 |
| - Row 1: Source Grounding: Inspect the exact paragraph behind every sentence.                      |
| - Row 2: Multi-Document Scoping: Select any subset of documents for cross-paper synthesis.        |
| - Row 3: Tabular Library: Sort, filter, and inspect document ingestion stages without guesswork.   |
|                                                                                                    |
|----------------------------------------------------------------------------------------------------|
| HONEST DATA HANDLING & PRIVACY (Verifiable Technical Facts)                                        |
| Local SQLite and ChromaDB storage. Ephemeral session tokens. Files sent only to Google Gemini API. |
| One-click workspace and vector deletion.                                                           |
+----------------------------------------------------------------------------------------------------+
```

#### State Matrix:
- **Default State:** Live upload zone and sample document action ready.
- **Upload In-Flight:** Real byte progress bar, stage transitions (Extracting -> Chunking -> Indexing).
- **Complete:** Automatically redirects into `/workspace/research` with the query pre-filled.
- **Error:** Displays specific validation failure (e.g. Scanned PDF with no text layer, file oversized) with actionable remediation.

---

### 6.2 App Shell and Global Navigation

```
+----------------------------------------------------------------------------------------------------+
| [Toggle] DocuMind AI  /  [Workspace: Default]  /  Research     [Search or Cmd+K]   [Theme] [Status] |
+------------------+---------------------------------------------------------------------------------+
| SIDEBAR          | MAIN WORKSPACE CANVAS                                                           |
|                  |                                                                                 |
| Workspace Select |                                                                                 |
| [Clinical Papers]|                                                                                 |
|                  |                                                                                 |
| - Home           |                                                                                 |
| - Documents      |                                                                                 |
| - Research       |                                                                                 |
| - Settings       |                                                                                 |
|                  |                                                                                 |
| [Workspace Caps] |                                                                                 |
| 3 Docs / 14 MB   |                                                                                 |
|                  |                                                                                 |
| [?] User Guide   |                                                                                 |
+------------------+---------------------------------------------------------------------------------+
```

#### Features:
- **Slim Collapsible Sidebar:** Linear-style density with subtle active indicator (1px left edge border, light tint).
- **Command Palette (`Cmd+K`):** Global search across document filenames, recent questions, settings shortcuts, and theme toggle.
- **Degraded Status Indicator:** Only appears when `GET /api/health` reports latency or disconnection. Zero permanent "Online" stickers.

---

### 6.3 Workspace Home (`/workspace`)
Replaces the 4-up stat dashboard with a **search-first start page**:

```
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|                             What would you like to research today?                                 |
|                                                                                                    |
|   +--------------------------------------------------------------------------------------------+   |
|   | [Search Icon] Ask a question across your documents or search by name...              [Enter] |   |
|   +--------------------------------------------------------------------------------------------+   |
|     Scope: [All Documents (4)]   [Filter Scope]                                                    |
|                                                                                                    |
|   RECENT DOCUMENTS                                       RECENT RESEARCH SESSIONS                  |
|   +--------------------------------------------------+   +---------------------------------------+ |
|   | Attention_Is_All_You_Need.pdf    4 Chunks  Ready |   | "Multi-head attention mechanisms"     | |
|   | Clinical_Trial_Protocol_v2.pdf  12 Chunks  Ready |   | 3 sources cited - 2 hours ago         | |
|   | Q3_Financial_Summary.txt         2 Chunks  Ready |   | "Biomarker efficacy endpoints"        | |
|   +--------------------------------------------------+   | 2 sources cited - Yesterday           | |
|   [View All Documents ->]                                +---------------------------------------+ |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

#### State Matrix:
- **Populated:** Shows search input, recent documents, and active sessions.
- **Empty Workspace:** The page transforms into an onboarding desk with a large drop zone, allowed file types read from `/api/config`, and a "Load Sample Document" button. Zero skeletons.

---

### 6.4 Document Library (`/workspace/documents`)
A **Notion-style property table**:

```
+----------------------------------------------------------------------------------------------------+
| Document Library                                  [Search documents...]  [Filter: All]  [+ Upload] |
+----------------------------------------------------------------------------------------------------+
| [ ] FILENAME                       STATUS       PAGES   CHUNKS   SIZE      UPLOADED     ACTIONS    |
|----------------------------------------------------------------------------------------------------|
| [x] Attention_Is_All_You_Need.pdf  * Ready      15      4        1.2 MB    Nov 05 2026  [Eye] [x]  |
| [ ] Clinical_Protocol_v2.pdf       * Ready      28      8        2.8 MB    Nov 05 2026  [Eye] [x]  |
| [ ] Architecture_Draft.pdf         * Ingesting  -       -        0.8 MB    Just now     [Spinner]  |
|----------------------------------------------------------------------------------------------------|
| Selected: 1 document | [Ask About Selected] [Reprocess] [Delete]                                   |
+----------------------------------------------------------------------------------------------------+
```

#### Features:
- Real status dot (`* Ready` in green, `* Indexing` in amber, `* Failed` in red).
- Sortable headers (Name, Date, Size, Chunks).
- Floating bulk-action bar appears when rows are selected.
- In-progress files poll real pipeline status from the backend.

---

### 6.5 Research Workspace (`/workspace/research`)
Adopts the **Google NotebookLM 3-zone source-centric desk**:

```
+----------------------------------------------------------------------------------------------------+
| [1. SOURCES: 22%]          | [2. CONVERSATIONAL CANVAS: 48%]       | [3. EVIDENCE & PDF: 30%]      |
| Scope: 2 of 2 Docs         |                                       | [Passage]  [Document Page]    |
| [x] Attention_Paper.pdf    | User: How does self-attention work?   |                               |
| [x] Clinical_Trial.pdf     |                                       | Excerpt [1]:                  |
|                            | Assistant (Source Serif 4):           | "An attention function can be |
| + New Session              | Self-attention connects all positions | described as mapping a query  |
| Sessions:                  | within a sequence to compute a        | and a set of key-value pairs  |
| - Transformer Queries      | representation [1]. Rather than       | to an output..."              |
| - Biomarker Efficacy       | processing sequentially, it computes  |                               |
|                            | attention weights in parallel [2].    | Source: Attention_Paper.pdf   |
| Suggested Questions:       |                                       | Page: 3 | Offset: 1420-1680   |
| - What is scaled dot-      | Sources Cited:                        |                               |
|   product attention?       | [1] Attention_Paper.pdf (Page 3)      | [Jump to Page in PDF Viewer]  |
| - How are keys and values  | [2] Attention_Paper.pdf (Page 4)      |                               |
|   projected?               |                                       | Real rendered PDF page 3 with |
|                            | [Composer: Ask a question...    ][->] | yellow highlight over passage |
+----------------------------------------------------------------------------------------------------+
```

#### State Matrix:
- **Empty Conversation:** Displays document scope summary, citation explanation, and 3 model-generated suggested questions based on selected files.
- **Generating:** Streams text into the reading canvas with a subtle cursor. "Stop Generating" button active.
- **Completed:** Renders validated citation chips `[1]`, `[2]`. Underneath: source summary cards.
- **Insufficient Evidence:** Truthful refusal card: *"I could not find sufficient information in your selected documents to answer this question accurately."* (No fabricated claims).
- **Mobile Viewport:** Left sources and right evidence panels become swipeable bottom sheets.

---

### 6.6 Dedicated Document Viewer (`/documents/:id`)
A full-screen, side-by-side reading environment:

```
+----------------------------------------------------------------------------------------------------+
| [< Library] Attention_Is_All_You_Need.pdf   [Page 3 of 15] [-][+]   [Search in Doc]  [Ask AI Doc] |
+-----------------------------------+----------------------------------------------------------------+
| OUTLINE & THUMBNAILS              | PDF.JS RENDERED PAGE CANVAS                                    |
| [Page 1: Abstract]                |                                                                |
| [Page 2: Introduction]            | An attention function can be described as mapping a query and  |
| [Page 3: Model Architecture] *    | a set of key-value pairs to an output...                       |
| [Page 4: Scaled Dot-Product]      |                                                                |
|                                   | [Target Passage Highlighted with 20% Amber Wash]               |
+-----------------------------------+----------------------------------------------------------------+
```

---

### 6.7 Workspace Settings (`/settings`)
Dedicated technical control panel:
- **Retrieval Engine Calibration:**
  - `top_k` (Number of retrieved chunks, default 4, slider 1 to 10).
  - Relevance Threshold (Cosine distance cutoff, default 0.65, slider 0.40 to 0.85).
- **Workspace Data Management:** Export citations, clear chat sessions, or permanently delete workspace and ChromaDB vectors.
- **System & Engine Specifications (Live from `GET /api/config`):** Active embedding model, generation model, vector dimensionality (768), and chunk window (600/100).

---

### 6.8 Documentation Site (`/docs`)
A **Stripe-style 3-column layout**:
- **Left Navigation:**
  - Getting Started (Overview, Quick Start)
  - Document Management (Uploading, Supported Types, Ingestion Stages)
  - Research Canvas (Asking Questions, Understanding Citations, Refusal Behavior)
  - System Limits & Security (File Limits, Data Retention, Multi-Tenant Isolation)
  - Troubleshooting (Scanned PDFs, Context Size, Error Messages)
  - Developer API Reference (OpenAPI specification table)
- **Center Column:** Comprehensive user-focused markdown guides.
- **Right Column:** Sticky "On this page" anchor navigation.

---

## 7. Component Inventory and State Matrix

| Component Name | Primitives & Roles | States Handled | Icon Affordance |
|---|---|---|---|
| `Button` | Primary, Secondary, Subtle, Danger | Default, Hover, Active, Focus, Disabled, Loading | Optional Left/Right icon |
| `IconButton` | Square 32px / 36px interactive touch target | Default, Hover, Active, Focus, Disabled | Lucide React icon |
| `StatusDot` | 6px indicator dot with text label | Ready (Green), Ingesting (Amber), Failed (Red) | None (minimalist) |
| `CitationMarker` | Interactive numbered token `[1]` | Normal, Hover, Active/Selected | None (tabular number) |
| `SourceCard` | Compact card showing document title & page | Default, Hover, Linked Highlight | `FileText`, `CheckCircle2` |
| `EvidenceExcerpt` | Quoted paper surface with excerpt & metadata | Default, Focused, Expanded | `Quote`, `ExternalLink` |
| `CommandPalette` | Floating search modal (`Cmd+K`) | Closed, Open, Searching, Empty Results | `Search`, `ArrowRight` |
| `UploadDropZone` | Bordered drag target with live limits | Idle, Dragging, Uploading, Error | `UploadCloud`, `File` |
| `EmptyState` | Purposeful action card for empty containers | Idle, Action executing | Contextual Lucide icon |
| `SkeletonLoader` | Subtle pulse placeholders during in-flight fetch | Active pulse (matches theme surface) | None |

---

## 8. Proposed Backend Extensions

To support the redesigned frontend while preserving all existing endpoints and tests, the following three endpoints are proposed:

1. **`POST /api/documents/sample`**
   - **Purpose:** Ingests the bundled public-domain paper (`attention_is_all_you_need.txt`) into the caller's session workspace.
   - **Justification:** Powers the landing page "Try with sample document" button and empty workspace onboarding without requiring users to upload private files on first visit.
   - **Contract:** Returns standard `DocumentResponse` schema.

2. **`POST /api/chat/suggested-questions`**
   - **Purpose:** Analyzes the first 2 chunks of selected documents and prompts `gemini-2.5-flash` to return 3 concise research questions.
   - **Justification:** Solves the blank-page problem in the Research Workspace.
   - **Contract:** Accepts `{ "workspace_id": "...", "document_ids": [...] }`, returns `{ "questions": ["...", "...", "..."] }`.

3. **`GET /api/documents/{id}/summary`**
   - **Purpose:** Returns a 2-sentence executive summary of an ingested document for the left-hand source inspector.
   - **Justification:** Powers the document inspector in the research workspace without re-running full chat queries.

*All existing 23 backend tests will be maintained, and new unit tests will be added for each endpoint.*

---

## 9. File and Folder Refactor Plan

```
frontend/src/
├── api/
│   └── client.js                     # Updated with new endpoints
├── assets/
│   ├── brand/
│   │   ├── logo.svg                  # New original brand mark
│   │   └── wordmark.svg              # Brand wordmark
│   └── sample/
│       └── sample_document.txt       # Public-domain sample file
├── components/
│   ├── ui/                           # Atoms & Base Components
│   │   ├── Button.jsx
│   │   ├── IconButton.jsx
│   │   ├── StatusDot.jsx
│   │   ├── CitationMarker.jsx
│   │   ├── SourceCard.jsx
│   │   ├── EvidenceExcerpt.jsx
│   │   ├── CommandPalette.jsx
│   │   ├── ResizablePanels.jsx
│   │   └── EmptyState.jsx
│   ├── layout/                       # Structural Shell
│   │   ├── AppShell.jsx              # Linear-style shell
│   │   ├── Sidebar.jsx               # Collapsible navigation
│   │   └── TopBar.jsx                # Breadcrumbs, Cmd+K trigger, theme
│   ├── research/                     # 3-Zone Research Desk
│   │   ├── SourcesPanel.jsx          # Left panel: document scoping & sessions
│   │   ├── ConversationCanvas.jsx    # Center: typeset reading column
│   │   ├── EvidencePanel.jsx         # Right: passage cards & PDF viewer
│   │   └── SuggestedQuestions.jsx    # Dynamic model prompts
│   ├── documents/                    # Library & Viewer
│   │   ├── DocumentTable.jsx         # Notion-style property table
│   │   ├── DocumentViewer.jsx        # Split PDF/TXT reader
│   │   └── UploadTray.jsx            # Floating multi-file progress tray
│   └── docs/                         # Documentation Site
│       ├── DocsSidebar.jsx           # Hierarchical navigation
│       └── DocsContent.jsx           # Guide renderer
├── context/
│   ├── ThemeContext.jsx              # Light / Dark / System provider
│   └── WorkspaceContext.jsx          # Multi-tenant workspace provider
├── pages/
│   ├── LandingPage.jsx               # Editorial split hero & live drop zone
│   ├── HomePage.jsx                  # Search-first workspace home
│   ├── DocumentsPage.jsx             # Notion-style library table
│   ├── ResearchPage.jsx              # 3-zone research workspace
│   ├── DocumentViewerPage.jsx        # Dedicated /documents/:id route
│   ├── SettingsPage.jsx              # Calibration & engine specifications
│   ├── DocsPage.jsx                  # 3-column user documentation
│   ├── PrivacyPage.jsx               # Verifiable privacy policy
│   ├── TermsPage.jsx                 # Verifiable terms of service
│   └── NotFoundPage.jsx              # Branded 404
├── index.css                         # Forest Pine / Warm Ember design tokens
└── main.jsx                          # Root entry point
```

---

## 10. Execution Plan (Phases R1 through R6)

Upon receiving user approval, implementation proceeds through the following sequential phases:
- **Phase R1: Foundations:** Forest Pine / Warm Ember tokens, Source Serif 4 + Inter typography, original SVG brand mark, base components, and command palette shell.
- **Phase R2: App Shell, Home, Library:** Linear-style shell, search-first home, onboarding states, and Notion-style property table.
- **Phase R3: Research Workspace & Document Viewer:** 3-zone source-centric desk, typeset answers, citation popovers, PDF viewer with passage highlighting, and suggested questions.
- **Phase R4: Landing, Docs, Legal, Settings:** Editorial split hero, live drop zone and sample document ingestion, 3-column documentation, and live settings page.
- **Phase R5: Quality & Verification:** End-to-end tests, accessibility audit (axe/WCAG AA), Lighthouse, cross-browser verification, and backend test regression check.
- **Phase R6: Polish & Launch:** Copy edit pass for zero em dashes, bundle optimization, regenerated screenshots for README, and final deployment checklist.
