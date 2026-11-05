# DocuMind AI: Page Layouts, Wireframes, and User Journeys

## 1. Landing Page Layout (`LandingPage.jsx`)

```
+-----------------------------------------------------------------------------------+
|  [DocuMind AI Logo]      Product   Features   How it Works   Docs   [Open Workspace] |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                                     HERO                                          |
|                 Real Document Research. Backed by Real Citations.                 |
|                                                                                   |
|     Upload complex PDFs and technical documents. Extract verifiable insights      |
|     with page-level citations grounded strictly in your source material.          |
|                                                                                   |
|                [ Start Researching ]      [ View Architecture ]                   |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           REAL PRODUCT PREVIEW                              |  |
|  |  (Faithful interactive rendering using the actual application components)   |  |
|  |                                                                             |  |
|  |  [Left: 2 Selected Docs] | [Center: Answer with [1] [2]] | [Right: Sources] |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                             HOW IT WORKS (REAL PIPELINE)                          |
|                                                                                   |
|  [ 1. Ingest & Validate ] -> [ 2. Extract & Chunk ] -> [ 3. Embed & Vectorize ]  |
|  Magic bytes & hash checks    PyMuPDF page tracking    Gemini 768-dim embeddings  |
|                                                                                   |
|  [ 4. Scoped Retrieval ]  -> [ 5. Stream Answer ]   -> [ 6. Validate Citations ]  |
|  ChromaDB distance filter     Gemini 2.5 Flash prose   Server-side chunk check    |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                         ARCHITECTURAL FEATURE BREAKDOWN                           |
|  (Alternating editorial rows instead of repetitive card grids)                    |
|                                                                                   |
|  Row 1: [Page-Level Grounding]                                                    |
|         Graphic: Verbatim excerpt card with line highlight                        |
|         Description: Answers link to exact PDF pages, never fabricated summaries. |
|                                                                                   |
|  Row 2: [Multi-Document Scope Control]                                            |
|         Graphic: Checkbox selection drawer                                        |
|         Description: Choose exactly which documents inform each query.            |
|                                                                                   |
|  Row 3: [Honest Refusal Mechanics]                                               |
|         Graphic: Insufficient context banner                                      |
|         Description: If evidence is absent, the system refuses rather than lies.  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                           SECURITY AND DATA ISOLATION                             |
|  - Cryptographically isolated visitor sessions.                                   |
|  - Zero third-party training on uploaded files.                                   |
|  - Permanent deletion: removing a document purges vectors and disk storage.       |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  DocuMind AI (c) 2026      [Privacy Policy]   [Terms of Service]   [Documentation] |
+-----------------------------------------------------------------------------------+
```

---

## 2. Main Workspace Layout (`WorkspaceShell.jsx`)

The workspace uses a persistent, high-efficiency two-part shell with a collapsible navigation sidebar and a contextual main view.

```
+--------------------+--------------------------------------------------------------+
| [DocuMind AI]      | Breadcrumbs: Workspace > Research              [Theme] [Menu] |
|                    +--------------------------------------------------------------+
| WORKSPACES         |                                                              |
| [v] Default Worksp |                                                              |
|  + New Workspace   |                                                              |
|                    |                                                              |
| NAVIGATION         |                     ACTIVE VIEW CONTAINER                    |
| [icon] Overview    |                                                              |
| [icon] Documents   |    (Renders Document Library, Research Workspace,            |
| [icon] AI Research |     or Workspace Settings)                                   |
| [icon] Sessions    |                                                              |
|                    |                                                              |
| [icon] Settings    |                                                              |
|                    |                                                              |
| [icon] System Docs |                                                              |
|                    |                                                              |
| [Collapse Sidebar] |                                                              |
+--------------------+--------------------------------------------------------------+
```

---

## 3. Document Library Layout (`DocumentsPage.jsx`)

```
+-----------------------------------------------------------------------------------+
| Documents                                      [Filter: All Status] [Upload File] |
| 3 documents indexed (4.8 MB total)                                                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                          DROP FILES HERE TO UPLOAD                          |  |
|  |          Supports PDF and TXT up to 20MB (configured dynamically)           |  |
|  |                          [ Select from Computer ]                           |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  [Search documents...]                                [Bulk Action: Delete (0)]   |
|                                                                                   |
|  [ ] Name                 Type   Size     Pages  Chunks  Status      Actions      |
|  -------------------------------------------------------------------------------  |
|  [ ] Clinical_Trial.pdf   PDF    2.4 MB   14     48      [Ready]     [...] [Del]  |
|  [ ] Protocol_Spec.pdf    PDF    1.8 MB   11     36      [Ready]     [...] [Del]  |
|  [ ] Lab_Notes.txt        TXT    0.6 MB   1      12      [Indexing]  [...] [Del]  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 4. AI Research Workspace Layout (`ResearchPage.jsx`)

The primary intellectual research screen. It uses a three-panel split canvas:

```
+------------------+------------------------------------+---------------------------+
| SELECTED SOURCES | AI RESEARCH CANVAS                 | EVIDENCE INSPECTOR        |
|                  |                                    |                           |
| [Search docs]    | [Session Title: Q2 Drug Analysis]  | Cited Passages (2)        |
|                  |                                    |                           |
| [x] Clinical.pdf | User:                              | [1] Clinical_Trial.pdf    |
|     14p | 48 ch  | "What efficacy was recorded in P2?"| Page 8 | Chunk 24         |
|                  |                                    | Score: 0.18 distance      |
| [x] Protocol.pdf | Assistant:                         | Excerpt:                  |
|     11p | 36 ch  | "The overall therapeutic efficacy  | "In the Phase 2 cohort    |
|                  | was recorded at 78.4 percent [1].  | (n=450), the overall      |
| [ ] Notes.txt    | Mild adverse events occurred in    | therapeutic efficacy was  |
|     1p | 12 ch   | fewer than 4 percent of subjects   | determined to be 78.4%."  |
|                  | [2]."                              | [View in PDF Preview ->]  |
|                  |                                    |                           |
|                  | [Copy]  [Regenerate]  [Share]      | [2] Clinical_Trial.pdf    |
|                  |                                    | Page 9 | Chunk 27         |
|                  | ---------------------------------- | Score: 0.24 distance      |
|                  | [ Ask a follow-up question...    ] | Excerpt:                  |
|                  | [ Submit Arrow ]                   | "Adverse events reported  |
|                  | Top_k: 5 | Model: Gemini 2.5 Flash | were mild to moderate..." |
+------------------+------------------------------------+---------------------------+
```

---

## 5. Document Preview Modal / Drawer (`DocumentPreview.jsx`)

When a user clicks "View in PDF Preview" from a citation card:
- A drawer slides in from the right (or expands to split view).
- Shows real PDF rendering using PDF.js.
- Automatically jumps to the specific cited `page_number`.
- Renders an overlay bounding box or text highlight over the cited sentence using text-layer character search.
- Navigation bar provides Previous Page, Next Page, Zoom In, Zoom Out, Page Input, and Document Metadata.

---

## 6. Responsive Adaptations

- **Desktop (1280px+):** Full three-panel research layout with visible sources and document selection sidebars.
- **Tablet (768px to 1279px):** Left document panel collapses into an off-canvas drawer. Research canvas and evidence inspector share the view or toggle via tabs.
- **Mobile (< 768px):** Single-column stacked view with tab bar: `[Research | Sources (2) | Documents (3)]`. The composer remains fixed at the bottom with touch-friendly spacing.

