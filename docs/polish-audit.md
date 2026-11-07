# DocuMind AI: Comprehensive Polish and Product Readiness Audit

**Document:** `docs/polish-audit.md`  
**Date:** November 2026  
**Auditor Roles:** Principal Product Designer, Senior Frontend Engineer, UX Writer, Release Engineer  
**Audit Target:** Current Localhost Build (`http://localhost:5173`)  
**Scope:** Route audit, visual craft inspection, information architecture, copy analysis, and defect prioritization  

---

## 1. Executive Summary

DocuMind AI has established a strong technical foundation: a working FastAPI RAG backend, verified multi-tenant session isolation, PyMuPDF page-bounded extraction, disk-persisted ChromaDB vector storage, server-side citation validation, rate limiting, and automated lifecycle purging. 

However, an evaluation of the user interface reveals that the product still carries the aesthetic and copy patterns of a student capstone project rather than an engineered, commercial research product. The public landing page uses a centered template layout with decorative badges and static mock cards; copy is heavy with academic and internal pipeline jargon; duplicate controls clutter the workspace shell; developer-focused telemetry leaks into user settings; and the sample document carries an inaccurate copyright attribution.

This audit documents every defect across five functional areas with concrete evidence, visual references from live browser captures (`docs/screenshots-polish/`), severity classifications, and architectural fixes.

---

## 2. Area Audits and Defect Catalog

### 2.1 Landing Page (`/`)

| Defect ID | Finding & Current State | Severity | Evidence / File | Planned Fix |
| :--- | :--- | :--- | :--- | :--- |
| **AUD-01** | **Centered Hero Template Structure:** Hero uses a centered headline with two stacked CTAs above a static card preview, characteristic of generic AI boilerplate. | High | `LandingPage.jsx:45-120`<br>`polish_landing_desktop_light.png` | Replace with a left-aligned, asymmetrical two-column layout: editorial value proposition on the left, live interactive onboarding widget on the right. |
| **AUD-02** | **Hardcoded Live Status Badge:** Displays `"System Online: Verified RAG Active"` in a green monospace pill badge. The text is static and creates false operational expectations. | High | `LandingPage.jsx:52`<br>`polish_landing_desktop_light.png` | Remove decorative pill badge entirely. Drive operational status exclusively from `GET /api/ready`, surfacing only an unobtrusive banner when degraded. |
| **AUD-03** | **Headline Names a Category, Not a Benefit:** `"Verifiable Document Research Desk"` reads like an internal project label rather than a customer benefit. | High | `LandingPage.jsx:62` | Rewrite headline to communicate user outcome directly: `"Ask your documents. See the page that answers."` |
| **AUD-04** | **Jargon-Heavy Body Copy:** Subheading reads: *"Ground research strictly across your uploaded PDF and text documents. Every assertion cites exact pages and passages verified server-side against stored chunks, stripping hallucinated references before they reach your screen."* Intimidating and difficult to parse. | High | `LandingPage.jsx:67` | Rewrite in one plain, conversational sentence: *"Upload your PDFs and ask questions. DocuMind highlights the exact paragraph and page for every answer."* |
| **AUD-05** | **Assignment-Style Public Navigation:** Header links include `"Pipeline Architecture"`, `"Comparison Matrix"`, and `"Settings"`. These confuse prospective users. | Medium | `LandingPage.jsx:32-42` | Clean navigation: Brand Wordmark, `"How it works"`, `"Privacy"`, `"Documentation"`, GitHub link, and `"Open workspace"` button. Remove Settings and Comparison Matrix from public header. |
| **AUD-06** | **Static Mock Hero Preview:** The preview displays hardcoded document cards (*"Attention_Is_All_You_..."*, *"Page 1 to 3 • 4.9 KB"*, *"2 verified citations / 0 stripped"*), violating the Zero Static Data invariant. | High | `LandingPage.jsx:130-220` | Replace static preview with an interactive onboarding component where visitors can drop a PDF or click the sample paper, query immediately, and transition into the workspace. |
| **AUD-07** | **Monospace Uppercase Micro-Labels:** Repeats decorative uppercase labels (`"ACTIVE SOURCE SCOPE"`, `"RESEARCHER INQUIRY"`, `"VERIFIED EVIDENCE"`, `"GROUNDED"`), a classic AI template trope. | Medium | `LandingPage.jsx:145-210` | Reserve monospace strictly for code spans, byte quantities, and identifiers. Use Inter with proper sentence case for UI labels. |
| **AUD-08** | **Empty Below-the-Fold Transition:** Below the hero preview, a large unstyled blank gap occurs before feature cards begin. | Medium | `polish_landing_desktop_light.png` | Structure narrative sections: Live Interactive Hero, 4-step "How it works" with genuine product screenshots, "Check every answer" citation walkthrough, Multi-document synthesis, "What it can and cannot do", and Trust/Privacy overview. |

---

### 2.2 Workspace Shell, Home & Document Library

| Defect ID | Finding & Current State | Severity | Evidence / File | Planned Fix |
| :--- | :--- | :--- | :--- | :--- |
| **AUD-09** | **Generic Dashed Upload Drop Zone:** The drop target is an oversized dashed rectangle with an icon tile, looking unrefined and unfinished. | High | `HomePage.jsx:210-250`<br>`polish_workspace_home_desktop_light.png` | Redesign as a calm, quietly bordered full-width surface with dynamic limits from `GET /api/config` that activates a full-window drop backdrop on drag over. |
| **AUD-10** | **Duplicate Actions and Search Inputs:** Both `"Add Documents"` and `"Try Sample Paper"` appear in multiple places simultaneously; both top-bar search and sidebar command menu trigger search. | Medium | `HomePage.jsx`<br>`Sidebar.jsx` | Consolidate to one prominent primary action (`"Add documents"`), one secondary action (`"Try a sample document"`), and a single platform-aware search input. |
| **AUD-11** | **Platform-Ignorant Keyboard Hints:** Shortcut hints display the Apple Command symbol (`⌘K`) exclusively, confusing Windows and Linux users. | Medium | `Header.jsx:82`<br>`Sidebar.jsx:112` | Implement client platform detection (`navigator.userAgent`): display `⌘K` on macOS and `Ctrl+K` on Windows/Linux. |
| **AUD-12** | **Unlabelled Top Bar Icon Buttons:** Header contains bare icon buttons (chat bubble, moon, external link) without visible tooltips or aria-label attributes. | High | `Header.jsx:95-130`<br>`axe-core` accessibility | Add explicit `aria-label` attributes and lightweight hover tooltips explaining each control's purpose. |
| **AUD-13** | **Active Sidebar Item Rendering Glitch:** A tiny curved stray graphic artifact renders at the right border of the active navigation item. | Low | `Sidebar.jsx:88`<br>`polish_workspace_home_desktop_light.png` | Clean CSS border-radius and clipping styles on active navigation links to eliminate stray hairline artifacts. |
| **AUD-14** | **Unexplained Heavy Workspace Switcher:** New visitors are immediately presented with a `"Default Workspace"` dropdown and selector, adding cognitive friction. | Medium | `Sidebar.jsx:45-75` | Streamline workspace header for single-workspace users; present workspace management only in Settings. |
| **AUD-15** | **Legally Inaccurate Document Licence Label:** The sample document *Attention Is All You Need* (Vaswani et al., 2017) is labeled `"PUBLIC DOMAIN"`. It is copyrighted by Google and distributed under the arXiv non-exclusive license. | Blocker | `HomePage.jsx:182`<br>`DocumentsPage.jsx:310` | Correct label and attribution immediately: `"Open research preprint (Vaswani et al., arXiv:1706.03762). Educational demonstration under fair use."` |

---

### 2.3 Research Workspace Desk (`/workspace/research`)

| Defect ID | Finding & Current State | Severity | Evidence / File | Planned Fix |
| :--- | :--- | :--- | :--- | :--- |
| **AUD-16** | **Right Evidence Panel Open on Empty State:** When opening a new research session with zero messages, the right evidence panel sits open with empty tabs (`Passages (0)` and `Document Page`). | High | `ResearchPage.jsx:550-620`<br>`polish_research_desk_desktop_light.png` | Keep right panel collapsed by default. Open it automatically when a citation is selected or when explicitly toggled by the user. |
| **AUD-17** | **Broken Send Button Layout:** When the message composer is empty or disabled, the Send icon stacks awkwardly above the text label `"Research"`. | High | `ResearchPage.jsx:780-815`<br>`polish_research_desk_desktop_light.png` | Fix flex layout: align icon and label horizontally with `inline-flex items-center gap-2`, proper padding, and distinct disabled styling. |
| **AUD-18** | **Redundant Empty State Copy:** The center research pane displays multiple repetitive instructions: *"Grounded Document Research Desk"*, *"Scoped to 0 of 0 document(s)"*, *"(Press Enter to submit)"*, and italics notes. | Medium | `ResearchPage.jsx:680-720` | Consolidate to a single, clear empty-state card with one prompt instruction and real suggestion chips. |
| **AUD-19** | **Stiff Academic Jargon in Research Copy:** Strings like *"Pose a research question"*, *"Suggested inquiries from active scope"*, and *"synthesized strictly across your selected sources"* sound robotic. | Medium | `ResearchPage.jsx` | Rewrite in clear, natural prose: *"Ask a question about your documents"*, *"Questions you could ask"*, and *"Verified source passages"*. |

---

### 2.4 User Settings & Developer Diagnostics (`/workspace/settings`)

| Defect ID | Finding & Current State | Severity | Evidence / File | Planned Fix |
| :--- | :--- | :--- | :--- | :--- |
| **AUD-20** | **Developer Diagnostics Exposed in Settings:** Page displays raw model names (`gemini-2.5-flash`), chunk sizes (600), relevance thresholds (0.65), database engines, and loopback latency pings. End users should not see backend internals. | High | `SettingsPage.jsx:110-240`<br>`polish_settings_desktop_light.png` | Split settings cleanly: **Settings** contains user-facing preferences (Appearance, Data Export, Retention Purge, Shortcuts); **Technical Details** lives on a separate page linked from the footer. |
| **AUD-21** | **Inconsistent App Shell:** Navigating to `/settings` renders a full-width page without the collapsible workspace sidebar, breaking navigation continuity. | Medium | `SettingsPage.jsx`<br>`App.jsx:49` | Embed Settings into the standard `WorkspaceLayout` shell so the sidebar and navigation remain persistent. |
| **AUD-22** | **Confusing Byte and Number Formatting:** File size is displayed as `"20 MB (2,09,71,520 bytes)"`, mixing units and using non-standard comma grouping. | Low | `SettingsPage.jsx:195` | Display human-friendly units only (`"20 MB"`) formatted via standard locale-aware utilities. |
| **AUD-23** | **Over-Engineered Theme Copy:** Theme options are labeled `"Warm Paper (Light)"`, `"Charcoal Ink (Dark)"`, and `"desk lighting"`. | Low | `SettingsPage.jsx:95-105` | Use universally understood labels: `"Light"`, `"Dark"`, and `"System"`. |
| **AUD-24** | **Redundant Status String:** Component renders `"Ready Healthy"` as a double status label. | Low | `SettingsPage.jsx:215` | Streamline to a single status dot and text: `StatusDot (green)` with `"Operational"`. |

---

### 2.5 Visual Craft, Polish & Non-Negotiables

| Defect ID | Finding & Current State | Severity | Planned Fix |
| :--- | :--- | :--- | :--- |
| **AUD-25** | **Generic Document Icon Brand Mark:** The brand mark is a standard file icon with arbitrary accents, lacking distinctiveness. | Medium | Design an authentic, geometric SVG brand mark evoking layered documents and precision indexing. |
| **AUD-26** | **Lack of Real Product Imagery:** Landing page lacks genuine screenshots captured from the real running application. | High | Generate genuine, unmocked PNG screenshots using the sample paper and live pipeline, embedded into the landing page. |
| **AUD-27** | **Inconsistent Focus Rings & Interactive States:** Various interactive buttons and links use mismatched focus rings (`ring-indigo-500`, `ring-emerald-600`, or none). | Medium | Standardize all interactive controls to Forest Pine focus rings (`ring-2 ring-forest-pine/20 ring-offset-1`). |
| **AUD-28** | **Missing Tabular Numerals:** File sizes, page numbers, and dates jump or jitter on table sorting due to proportional number spacing. | Low | Apply `font-variant-numeric: tabular-nums` (`tabular-nums`) to all counts, dates, and metric displays. |
| **AUD-29** | **Zero Em Dash Verification:** Ensure zero em dash characters (`\u2014`) exist anywhere in the application or copy. | Blocker | Enforce via automated scanner (`scripts/verify_hygiene.py`). Verified 0 violations currently. |

---

## 3. Severity Triage Summary

- **Blocker (1):** AUD-15 (Copyright attribution on sample research paper).
- **High Severity (9):** AUD-01 (Centered hero), AUD-02 (Static live status badge), AUD-03 (Category label headline), AUD-04 (Jargon copy), AUD-06 (Static hero preview), AUD-09 (Dashed drop zone), AUD-12 (Unlabelled icon buttons), AUD-16 (Open right panel on empty state), AUD-17 (Broken composer button layout), AUD-20 (Exposed developer diagnostics in user settings), AUD-26 (Missing real screenshots).
- **Medium Severity (10):** AUD-05 (Assignment public nav), AUD-07 (Decorative uppercase mono), AUD-08 (Blank fold gap), AUD-10 (Duplicate actions), AUD-11 (Platform-ignorant shortcut hints), AUD-14 (Heavy workspace switcher), AUD-18 (Redundant empty state copy), AUD-19 (Stiff research copy), AUD-21 (Inconsistent shell on settings), AUD-25 (Generic brand mark), AUD-27 (Inconsistent focus rings).
- **Low Severity (4):** AUD-13 (Sidebar hairline glitch), AUD-22 (Raw byte formatting), AUD-23 (Cute theme names), AUD-24 (Redundant status text), AUD-28 (Tabular numerals).
