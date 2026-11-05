# DocuMind AI: Design System Specification

## 1. Design System Philosophy

DocuMind AI is designed as a tool-grade document research workstation. It avoids trendy visual clutter such as glowing purple gradients, floating spheres, mesh backgrounds, and pill-shaped buttons. Instead, it emphasizes typographic clarity, high-density information architecture, and micro-precision.

Key Principles:
- **Light mode default with dedicated dark mode:** Light mode uses warm off-white surfaces (`#FBFBFB` canvas, `#FFFFFF` cards, `#F4F4F5` subtle panels) with charcoal text (`#18181B`). Dark mode uses deep obsidian surfaces (`#09090B` canvas, `#121215` cards, `#18181B` borders) with crisp off-white text (`#FAFAFA`).
- **Restrained color application:** Monochromatic neutral foundation paired with a single electric indigo accent (`#4F46E5` in light, `#6366F1` in dark) used exclusively for active states, focus rings, primary action triggers, and verified citation links.
- **Hairline borders over heavy drop shadows:** Structural boundaries use 1px hairlines (`#E4E4E7` light, `#27272A` dark) instead of blurry drop shadows. Depth is established through luminance steps between background surfaces.
- **Consistent square-ish corner radii:** Restrained border radii (4px for inputs/badges, 6px for buttons/cards, 8px for large modal dialogs). Pill-shaped buttons are explicitly prohibited.
- **Editorial distinction for evidence:** Highlighting and verbatim quotes from primary source documents use a distinct typographic treatment (monospace or subtle editorial serif styling with light amber/neutral tint) so users never confuse generated answers with source material.

---

## 2. Design Tokens

### 2.1 Color Tokens

```css
:root {
  /* Canvas and Surfaces (Light Mode) */
  --dm-bg-canvas: #FBFBFB;
  --dm-bg-surface: #FFFFFF;
  --dm-bg-surface-subtle: #F4F4F5;
  --dm-bg-surface-elevated: #FFFFFF;
  --dm-bg-hover: #F0F0F2;
  --dm-bg-active: #E4E4E7;

  /* Text & Content (Light Mode) */
  --dm-text-primary: #18181B;
  --dm-text-secondary: #52525B;
  --dm-text-muted: #71717A;
  --dm-text-disabled: #A1A1AA;
  --dm-text-inverse: #FAFAFA;

  /* Borders & Hairlines (Light Mode) */
  --dm-border-default: #E4E4E7;
  --dm-border-subtle: #F0F0F2;
  --dm-border-strong: #D4D4D8;
  --dm-border-focus: #4F46E5;

  /* Brand Accent (Electric Indigo) */
  --dm-accent: #4F46E5;
  --dm-accent-hover: #4338CA;
  --dm-accent-subtle: #EEF2FF;
  --dm-accent-text: #3730A3;

  /* Semantic Feedback */
  --dm-success-bg: #ECFDF5;
  --dm-success-border: #A7F3D0;
  --dm-success-text: #065F46;

  --dm-warning-bg: #FFFBEB;
  --dm-warning-border: #FDE68A;
  --dm-warning-text: #92400E;

  --dm-error-bg: #FEF2F2;
  --dm-error-border: #FECACA;
  --dm-error-text: #991B1B;

  --dm-info-bg: #F0F9FF;
  --dm-info-border: #BAE6FD;
  --dm-info-text: #075985;

  /* Evidence Excerpt Highlight */
  --dm-evidence-bg: #F8FAFC;
  --dm-evidence-border: #CBD5E1;
  --dm-evidence-highlight: #FEF08A;
  --dm-evidence-text: #334155;
}

[data-theme="dark"] {
  /* Canvas and Surfaces (Dark Mode) */
  --dm-bg-canvas: #09090B;
  --dm-bg-surface: #121215;
  --dm-bg-surface-subtle: #18181B;
  --dm-bg-surface-elevated: #1F1F23;
  --dm-bg-hover: #222226;
  --dm-bg-active: #27272A;

  /* Text & Content (Dark Mode) */
  --dm-text-primary: #FAFAFA;
  --dm-text-secondary: #A1A1AA;
  --dm-text-muted: #71717A;
  --dm-text-disabled: #52525B;
  --dm-text-inverse: #18181B;

  /* Borders & Hairlines (Dark Mode) */
  --dm-border-default: #27272A;
  --dm-border-subtle: #1E1E22;
  --dm-border-strong: #3F3F46;
  --dm-border-focus: #6366F1;

  /* Brand Accent (Electric Indigo in Dark) */
  --dm-accent: #6366F1;
  --dm-accent-hover: #818CF8;
  --dm-accent-subtle: #1E1B4B;
  --dm-accent-text: #C7D2FE;

  /* Semantic Feedback */
  --dm-success-bg: #064E3B;
  --dm-success-border: #047857;
  --dm-success-text: #A7F3D0;

  --dm-warning-bg: #78350F;
  --dm-warning-border: #B45309;
  --dm-warning-text: #FDE68A;

  --dm-error-bg: #7F1D1D;
  --dm-error-border: #B91C1C;
  --dm-error-text: #FECACA;

  --dm-info-bg: #0C4A6E;
  --dm-info-border: #0284C7;
  --dm-info-text: #BAE6FD;

  /* Evidence Excerpt Highlight */
  --dm-evidence-bg: #111827;
  --dm-evidence-border: #374151;
  --dm-evidence-highlight: #713F12;
  --dm-evidence-text: #E5E7EB;
}
```

### 2.2 Typography Scale

- Primary UI Font: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
- Code and Source Citation Font: `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `monospace`
- Reading Measure: Maximum 68ch for AI responses and source passages to guarantee readability.

| Token | Size | Line Height | Tracking | Recommended Use |
|---|---|---|---|---|
| `type-xs` | 11px (0.6875rem) | 16px (1.45) | +0.02em | Badges, timestamps, citation indexes, status chips |
| `type-sm` | 13px (0.8125rem) | 18px (1.38) | 0.00em | Sidebar links, secondary labels, table cells, metadata |
| `type-base` | 14px (0.875rem) | 22px (1.57) | -0.005em | Default body text, question composer, form controls |
| `type-md` | 15px (0.9375rem) | 24px (1.60) | -0.01em | Research answers, primary long-form reading |
| `type-lg` | 18px (1.125rem) | 26px (1.44) | -0.015em | Panel titles, modal headings, section titles |
| `type-xl` | 24px (1.5rem) | 32px (1.33) | -0.02em | Workspace headers, page headings |
| `type-2xl` | 32px (2.0rem) | 38px (1.19) | -0.025em | Marketing page section titles |
| `type-display` | 44px (2.75rem) | 50px (1.14) | -0.035em | Landing page hero headline |

### 2.3 Spacing System (8px Grid Foundation)

| Token | Value | Practical Application |
|---|---|---|
| `space-1` | 4px | Micro padding inside badges, citation tags, button gaps |
| `space-2` | 8px | Button inline padding, icon gaps, input vertical padding |
| `space-3` | 12px | Dropdown item padding, list item gaps, small card padding |
| `space-4` | 16px | Standard card padding, modal body inset, toolbar gaps |
| `space-5` | 20px | Section margins, header heights, medium card spacing |
| `space-6` | 24px | Workspace panel interior padding, table cell horizontal padding |
| `space-8` | 32px | Major component gaps, drawer separation |
| `space-12` | 48px | Page section spacing, landing page row intervals |
| `space-16` | 64px | Hero vertical spacing |

### 2.4 Border Radius Hierarchy

Pill-shaped buttons (such as `rounded-full` on standard action controls) are strictly forbidden.
- `radius-xs`: 2px (checkboxes, micro citation tags)
- `radius-sm`: 4px (status badges, code tags, small inputs)
- `radius-md`: 6px (standard buttons, text inputs, dropdown menus, document cards)
- `radius-lg`: 8px (dialogs, upload dropzone, evidence panels)
- `radius-none`: 0px (split-pane divider borders, full-height drawer edges)

### 2.5 Shadows and Elevation

- `elevation-0`: none (flat panels with 1px border)
- `elevation-1`: 0 1px 2px rgba(0, 0, 0, 0.05) (cards, hover states)
- `elevation-2`: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05) (dropdowns, tooltips)
- `elevation-3`: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.08) (modals, slide-over panels)

### 2.6 Motion and Transitions

Transitions must respect `prefers-reduced-motion: reduce`.
- Standard micro-interaction duration: 150ms `cubic-bezier(0.16, 1, 0.3, 1)`
- Panel expansion / collapse: 200ms `cubic-bezier(0.16, 1, 0.3, 1)`
- Real streaming text: Progressive chunk append without artificial delay

---

## 3. Core Component System Inventory

### 3.1 Buttons (`Button.jsx`)
- Variants: `primary` (solid indigo), `secondary` (surface with 1px border), `subtle` (transparent with hover surface), `destructive` (red alert border/text).
- Sizes: `sm` (28px height, 12px font), `md` (36px height, 13px font), `lg` (42px height, 14px font).
- Corner radius: `radius-md` (6px). Visible outline focus ring (`ring-2 ring-indigo-500`).
- States: idle, hover, active, loading (inline spinner), disabled.

### 3.2 Citation Marker (`CitationMarker.jsx`)
- Appearance: Compact superscript/inline chip: `[1]`, `[2]`.
- Style: Monospace font, 11px, subtle indigo background (`--dm-accent-subtle`), indigo text (`--dm-accent-text`), 2px corner radius.
- Interaction:
  - On hover: reveals lightweight popover with document name, page number, and 2-line snippet preview.
  - On click: activates the right-hand evidence panel, focuses the exact chunk card, and scrolls to the highlighted excerpt.
  - Keyboard accessible: tabbable with visible focus ring.

### 3.3 Evidence Excerpt Block (`EvidenceExcerpt.jsx`)
- Appearance: Distinct bordered card with subtle surface (`--dm-evidence-bg`), 1px hairline border (`--dm-evidence-border`).
- Header: Document name with file icon (PDF or TXT), page indicator (e.g., "Page 4"), chunk index badge, and calculated similarity/relevance score.
- Body: Verbatim extracted text with yellow highlight on matched keywords or key sentences.
- Footer action: "View in document preview" button opening the PDF or TXT viewer at that specific page.

### 3.4 Document Table Row (`DocumentRow.jsx`)
- Columns:
  1. Multi-select checkbox.
  2. Document title with format icon (Lucide `FileText` for PDF, `AlignLeft` for TXT).
  3. File size (formatted cleanly, e.g., 2.4 MB).
  4. Pages count (e.g., 14 pages).
  5. Indexed chunks (e.g., 42 chunks).
  6. Pipeline Status badge (`Uploaded`, `Extracting`, `Chunking`, `Generating embeddings`, `Indexing`, `Ready`, `Failed`).
  7. Actions: Reprocess, Preview, Delete.

### 3.5 Status Badge (`StatusBadge.jsx`)
- `Ready`: Emerald green badge with check icon.
- `Extracting` / `Chunking` / `Generating embeddings` / `Indexing`: Indigo or blue badge with subtle pulse indicator.
- `Uploaded`: Neutral gray badge.
- `Failed`: Crimson badge with alert triangle and hover tooltip displaying the exact server-provided error message.

### 3.6 Upload Drop Zone (`UploadDropZone.jsx`)
- States: idle, drag-over, uploading (with real progress bar displaying actual transferred bytes and total bytes), error (rejected file type or size exceeded).
- Restrictions: Read dynamically from `GET /api/config` (never hardcoded in component). Displays accepted MIME types and maximum file size.

### 3.7 Research Three-Panel Layout (`ResearchWorkspace.jsx`)
- Left Panel (260px wide, collapsible): Document selector (checkboxes to scope retrieval), filter by workspace, new session trigger.
- Center Panel (Flex-grow, max 800px readable width): Question composer, chat history, streamed answer output, copy button, clear session.
- Right Panel (380px wide, collapsible): Source evidence inspector, retrieved passages list, document preview drawer.
- Responsive Behavior: Stacks on mobile viewports into single-column tabbed navigation (Answer | Sources | Documents).

### 3.8 Empty and Loading States
- Empty Document Library: Educational prompt with upload drop zone, accepted file formats, and instructions to get started. No fake charts or fake file counts.
- Empty Research Canvas: Actionable guidance explaining how to select documents and submit a research question.
- Loading Skeletons: High-fidelity layout skeletons that match the exact geometry of answer cards and document rows while real requests are in flight.
