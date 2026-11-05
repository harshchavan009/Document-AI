import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Sparkles,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Command,
  Sun,
  Moon,
  Upload,
} from "lucide-react";
import { Button, IconButton } from "../components/ui/Button";
import { StatusDot } from "../components/ui/StatusDot";
import { CitationMarker } from "../components/ui/CitationMarker";
import { EvidenceExcerpt, SourceCard } from "../components/ui/EvidenceExcerpt";
import { BrandWordmark, BrandMark } from "../components/ui/BrandMark";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";
import { useTheme } from "../context/ThemeContext";

export function DesignSystemPage() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [activeCitation, setActiveCitation] = useState(1);

  const sampleCitation = {
    citation_index: 1,
    document_id: "demo-doc-123",
    filename: "Attention_Is_All_You_Need.pdf",
    page_number: 3,
    start_char: 1420,
    end_char: 1680,
    excerpt:
      "An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors.",
    relevance_score: 0.18,
  };

  const sampleCitation2 = {
    citation_index: 2,
    document_id: "demo-doc-123",
    filename: "Attention_Is_All_You_Need.pdf",
    page_number: 4,
    start_char: 2100,
    end_char: 2350,
    excerpt:
      "Instead of performing a single attention function with d_model-dimensional keys, values and queries, we found it beneficial to linearly project the queries, keys and values h times with different, learned linear projections.",
    relevance_score: 0.24,
  };

  return (
    <div className="min-h-screen bg-canvas text-content-primary p-6 sm:p-12 max-w-5xl mx-auto space-y-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Link to="/workspace">
            <Button size="xs" variant="subtle" icon={ArrowLeft}>
              Back to Workspace
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <BrandWordmark size={22} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="secondary"
            icon={resolvedTheme === "light" ? Moon : Sun}
            onClick={toggleTheme}
          >
            {resolvedTheme === "light" ? "Switch to Dark" : "Switch to Light"}
          </Button>
          <Button
            size="xs"
            variant="primary"
            icon={Command}
            onClick={() =>
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true })
              )
            }
          >
            Open Palette (⌘K)
          </Button>
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content-primary">
          Phase R1: Foundations Design System Showcase
        </h1>
        <p className="text-xs text-content-secondary mt-1">
          Standardized tokens, typography, brand marks, and base components adhering to the master research desk specification.
        </p>
      </div>

      {/* 1. Brand Mark & Wordmark */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-content-muted border-b border-border pb-1">
          1. Brand Identity Assets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-[6px] border border-border bg-surface flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-content-primary">Original Vector Mark</div>
              <div className="text-[11px] text-content-muted">Folded document corner + citation bracket</div>
            </div>
            <div className="p-2 rounded bg-surface-subtle text-accent border border-border">
              <BrandMark size={28} />
            </div>
          </div>

          <div className="p-4 rounded-[6px] border border-border bg-surface flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-content-primary">Brand Wordmark</div>
              <div className="text-[11px] text-content-muted">DocuMind AI typographic lockup</div>
            </div>
            <BrandWordmark size={20} />
          </div>
        </div>
      </section>

      {/* 2. Color Architecture */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-content-muted border-b border-border pb-1">
          2. Color Token Architecture
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-[5px] bg-canvas border border-border space-y-1">
            <div className="font-semibold text-content-primary">Canvas</div>
            <div className="text-[11px] text-content-muted">Paper Neutral</div>
          </div>
          <div className="p-3 rounded-[5px] bg-surface border border-border space-y-1">
            <div className="font-semibold text-content-primary">Surface</div>
            <div className="text-[11px] text-content-muted">Elevated Card</div>
          </div>
          <div className="p-3 rounded-[5px] bg-accent text-accent-contrast space-y-1">
            <div className="font-semibold">Forest Pine</div>
            <div className="text-[11px] opacity-80">Primary Accent</div>
          </div>
          <div className="p-3 rounded-[5px] bg-citation border border-citation-border text-citation-text space-y-1">
            <div className="font-semibold">Warm Ember</div>
            <div className="text-[11px]">Citation Token</div>
          </div>
        </div>
      </section>

      {/* 3. Typography Stack */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-content-muted border-b border-border pb-1">
          3. Typography Hierarchy
        </h2>
        <div className="space-y-3 p-5 rounded-[6px] border border-border bg-surface">
          <div>
            <div className="text-[11px] text-content-muted uppercase tracking-wider mb-0.5">
              Source Serif 4 (Reading Typography for Answers & Citations)
            </div>
            <p className="font-reading text-base leading-relaxed text-content-primary">
              "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder."
            </p>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="text-[11px] text-content-muted uppercase tracking-wider mb-0.5">
              Inter Variable (Interface Sans for Chrome & Controls)
            </div>
            <p className="font-sans text-xs text-content-secondary">
              High-density structural labels, form controls, navigation items, and tabular metadata.
            </p>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="text-[11px] text-content-muted uppercase tracking-wider mb-0.5">
              JetBrains Mono (Strictly for IDs and API Specifications)
            </div>
            <p className="font-code text-xs text-content-secondary">
              POST /api/chat/stream?session_id=usr_098f6bcd4621d373cade4e832627b4f6
            </p>
          </div>
        </div>
      </section>

      {/* 4. Button Matrix */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-content-muted border-b border-border pb-1">
          4. Button Primitives (Restrained Radii 5px, Zero Pills)
        </h2>
        <div className="p-5 rounded-[6px] border border-border bg-surface space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs" variant="primary">Primary XS</Button>
            <Button size="sm" variant="primary">Primary SM</Button>
            <Button size="md" variant="primary">Primary MD</Button>
            <Button size="lg" variant="primary">Primary LG</Button>
            <Button size="sm" variant="primary" loading>Loading</Button>
            <Button size="sm" variant="primary" disabled>Disabled</Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="secondary" icon={Upload}>Secondary</Button>
            <Button size="sm" variant="outline">Outline</Button>
            <Button size="sm" variant="subtle">Subtle</Button>
            <Button size="sm" variant="danger">Danger</Button>
            <IconButton icon={Search} label="Search" size="sm" variant="secondary" />
            <IconButton icon={Sparkles} label="AI Action" size="sm" variant="primary" />
          </div>
        </div>
      </section>

      {/* 5. Minimalist Status Indicators */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-content-muted border-b border-border pb-1">
          5. Status Indicators (Minimalist Dot + Text, Zero Capsules)
        </h2>
        <div className="p-5 rounded-[6px] border border-border bg-surface flex flex-wrap items-center gap-6">
          <StatusDot status="Ready" />
          <StatusDot status="Extracting" />
          <StatusDot status="Chunking" />
          <StatusDot status="Indexing" />
          <StatusDot status="Uploaded" />
          <StatusDot status="Failed" errorMessage="Scanned PDF contains no extractable text layer. OCR is not enabled." />
        </div>
      </section>

      {/* 6. Citations & Evidence Architecture */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-content-muted border-b border-border pb-1">
          6. Grounded Citation Tokens and Quoted Evidence Cards
        </h2>
        <div className="p-5 rounded-[6px] border border-border bg-surface space-y-5">
          <div className="text-xs text-content-secondary leading-relaxed">
            Hover or click to preview citation details:
            <span className="font-reading text-sm text-content-primary ml-2">
              "We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism
              <CitationMarker
                index={1}
                citation={sampleCitation}
                active={activeCitation === 1}
                onClick={() => setActiveCitation(1)}
              />
              to draw global dependencies between input and output
              <CitationMarker
                index={2}
                citation={sampleCitation2}
                active={activeCitation === 2}
                onClick={() => setActiveCitation(2)}
              />
              ."
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EvidenceExcerpt
              citation={activeCitation === 1 ? sampleCitation : sampleCitation2}
              active={true}
              onOpenPreview={(docId, page) => alert(`Jumping to document ${docId} page ${page}`)}
            />
            <div className="space-y-2">
              <SourceCard
                citation={sampleCitation}
                active={activeCitation === 1}
                onClick={() => setActiveCitation(1)}
              />
              <SourceCard
                citation={sampleCitation2}
                active={activeCitation === 2}
                onClick={() => setActiveCitation(2)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Empty State Primitive */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-content-muted border-b border-border pb-1">
          7. Purposeful Action Empty State
        </h2>
        <EmptyState
          icon={FileText}
          title="Document library is ready for your research files"
          description="Upload your multi-page technical papers or legal PDFs. Citations and vector indices are created on ingestion."
          actionLabel="Select Document"
          actionIcon={Upload}
          onAction={() => alert("Open file picker")}
          secondaryActionLabel="Try with Sample Paper"
          onSecondaryAction={() => alert("Load sample paper")}
        />
      </section>
    </div>
  );
}

