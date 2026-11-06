import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lock,
  Layers,
  BookOpen,
  Cpu,
  Database,
  ExternalLink,
  SlidersHorizontal,
  Quote,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { BrandWordmark, BrandMark } from "../components/ui/BrandMark";
import { useTheme } from "../context/ThemeContext";
import { api } from "../api/client";

function GitHubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [config, setConfig] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cfg, hlth] = await Promise.all([
          api.getConfig().catch(() => null),
          api.getHealth().catch(() => null),
        ]);
        if (cfg) setConfig(cfg);
        if (hlth) setHealth(hlth);
      } catch (err) {
        console.error("Failed to load landing data:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-content-primary flex flex-col">
      {/* Top Navigation */}
      <header className="h-14 border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center" title="DocuMind AI Home">
          <BrandWordmark size={19} />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-content-secondary">
          <a href="#preview" className="hover:text-content-primary transition-colors">
            Research Desk
          </a>
          <a href="#pipeline" className="hover:text-content-primary transition-colors">
            Pipeline Architecture
          </a>
          <a href="#comparison" className="hover:text-content-primary transition-colors">
            Comparison Matrix
          </a>
          <Link to="/docs" className="hover:text-content-primary transition-colors">
            Documentation
          </Link>
          <Link to="/settings" className="hover:text-content-primary transition-colors">
            Settings
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://github.com/harshchavan009/Document-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition-colors hidden sm:inline-flex"
            title="GitHub Repository"
          >
            <GitHubIcon className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition-colors cursor-pointer"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link to="/workspace">
            <Button size="sm">Open Workspace</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-14 pb-12 sm:pt-20 sm:pb-16 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        {/* Real Live Health Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[5px] border border-border bg-surface text-content-secondary text-xs font-mono mb-6 shadow-xs">
          <span className={`w-2 h-2 rounded-full ${health?.status === "healthy" ? "bg-semantic-success-text" : "bg-semantic-warning-text"}`} />
          <span>
            {health?.status === "healthy"
              ? "System Online: Verified RAG Active"
              : "Connecting to Local RAG Engine"}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-content-primary leading-[1.18] mb-6 max-w-4xl mx-auto">
          Verifiable Document Research Desk
        </h1>

        <p className="text-sm sm:text-base text-content-secondary max-w-2xl mx-auto leading-relaxed mb-8 font-sans">
          Ground research strictly across your uploaded PDF and text documents. Every assertion cites exact pages and passages verified server-side against stored chunks, stripping hallucinated references before they reach your screen.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          <Link to="/workspace">
            <Button size="lg" icon={ArrowRight}>
              Open Research Workspace
            </Button>
          </Link>
          <Link to="/docs">
            <Button size="lg" variant="secondary" icon={BookOpen}>
              System Documentation
            </Button>
          </Link>
        </div>

        {/* ========================================================= */}
        {/* Authentic Product Preview (Zero Fiction, Real Paper Data) */}
        {/* ========================================================= */}
        <div
          id="preview"
          className="rounded-[8px] border border-border bg-surface shadow-md p-3 sm:p-5 text-left text-xs max-w-4xl mx-auto overflow-hidden"
        >
          {/* Desk Preview Toolbar */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
            <div className="flex items-center gap-2 min-w-0">
              <BrandMark size={16} className="text-accent" />
              <span className="font-semibold text-content-primary truncate text-xs">
                DocuMind Research Desk: Grounded Session Snapshot
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-content-muted">
              <span className="hidden sm:inline">Server-side chunk verification</span>
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success-text" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left Column: Real Document Scoped */}
            <div className="md:col-span-3 border border-border bg-surface-subtle p-3 rounded-[5px] space-y-2.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-content-muted font-semibold">
                Active Source Scope
              </div>
              <div className="p-2.5 rounded-[5px] bg-surface border border-accent-subtle/80 text-xs space-y-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="font-semibold text-content-primary truncate text-xs">
                    Attention_Is_All_You_Need.txt
                  </span>
                </div>
                <div className="text-[10px] text-content-muted font-mono pl-5">
                  Page 1 to 3 • 4.9 KB
                </div>
              </div>
              <div className="text-[11px] text-content-muted leading-relaxed">
                Queries are scoped strictly to selected documents in your workspace.
              </div>
            </div>

            {/* Center Column: Grounded Inquiry and Typeset Answer */}
            <div className="md:col-span-5 border border-border bg-surface p-3.5 rounded-[5px] space-y-3">
              <div className="text-[11px] font-mono text-content-muted uppercase tracking-wider font-semibold">
                Researcher Inquiry
              </div>
              <div className="text-xs font-semibold text-content-primary">
                "What is the primary contribution of the Transformer architecture?"
              </div>

              <div className="p-3 rounded-[5px] bg-canvas border border-border/70 text-xs leading-relaxed text-content-primary font-reading space-y-2">
                <p>
                  The primary contribution of the Transformer is the replacement of recurrent and convolutional layers entirely with multi-head self-attention mechanisms{" "}
                  <span className="inline-block px-1 rounded-[3px] bg-citation border border-citation-border text-citation-text font-bold text-[10px] font-mono">
                    [1]
                  </span>.
                </p>
                <p>
                  This architecture eliminates sequential computation constraints, allowing significantly greater parallelization during training while achieving superior translation quality{" "}
                  <span className="inline-block px-1 rounded-[3px] bg-citation border border-citation-border text-citation-text font-bold text-[10px] font-mono">
                    [2]
                  </span>.
                </p>
              </div>

              <div className="text-[11px] text-content-muted font-mono flex items-center justify-between pt-1">
                <span>2 verified citations</span>
                <span className="text-semantic-success-text">0 stripped</span>
              </div>
            </div>

            {/* Right Column: Verified Ground Truth Citations */}
            <div className="md:col-span-4 border border-border bg-surface-subtle p-3 rounded-[5px] space-y-2.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-content-muted font-semibold flex items-center justify-between">
                <span>Verified Evidence</span>
                <span className="text-semantic-success-text flex items-center gap-1 font-mono text-[10px]">
                  <CheckCircle2 className="w-3 h-3" /> Grounded
                </span>
              </div>

              {/* Citation 1 Card */}
              <div className="p-2.5 rounded-[5px] bg-surface border border-citation-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold font-mono text-citation-text">[1] Page 1</span>
                  <span className="text-[10px] font-mono text-semantic-success-text">88% match</span>
                </div>
                <p className="font-reading text-[11px] italic text-content-primary line-clamp-2">
                  "We propose the Transformer, a model architecture eschewing recurrence and entirely relying on an attention mechanism."
                </p>
              </div>

              {/* Citation 2 Card */}
              <div className="p-2.5 rounded-[5px] bg-surface border border-citation-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold font-mono text-citation-text">[2] Page 2</span>
                  <span className="text-[10px] font-mono text-semantic-success-text">82% match</span>
                </div>
                <p className="font-reading text-[11px] italic text-content-primary line-clamp-2">
                  "Experiments show these models to be superior in quality while being more parallelizable and requiring less training time."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three-Stage Architecture Section */}
      <section id="pipeline" className="py-16 sm:py-20 border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
              Deterministic Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-content-primary">
              How Grounded Research Operates
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed font-sans">
              Every stage is deterministic, authenticated, and inspectable. No synthetic steps or opaque cloud indexing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-[6px] border border-border bg-canvas space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-[4px] bg-accent-subtle/80 text-accent flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-sm font-semibold text-content-primary">
                Magic-Byte Extraction
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed font-sans">
                Uploaded files are defensively checked for genuine binary headers (%PDF- and valid UTF-8). PyMuPDF extracts text page-by-page while preserving exact character coordinate bounds.
              </p>
            </div>

            <div className="p-5 rounded-[6px] border border-border bg-canvas space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-[4px] bg-accent-subtle/80 text-accent flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-sm font-semibold text-content-primary">
                Sentence Chunking & Vector Store
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed font-sans">
                Text is segmented with strict token overlap across sentence boundaries. High-dimensional vector embeddings are stored in a persistent local ChromaDB instance isolated per visitor workspace.
              </p>
            </div>

            <div className="p-5 rounded-[6px] border border-border bg-canvas space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-[4px] bg-accent-subtle/80 text-accent flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-sm font-semibold text-content-primary">
                Server-Side Citation Filtering
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed font-sans">
                When answers are synthesized, every bracketed token [N] is verified server-side against the candidate chunks retrieved. Hallucinated or unverified citation tokens are stripped before display.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix: Generative AI vs Grounded Research */}
      <section id="comparison" className="py-16 sm:py-20 border-t border-border bg-canvas">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
              Calibrated Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-content-primary">
              Standard Generative AI vs DocuMind AI
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              Why document researchers rely on server-validated ground truth over conversational memory.
            </p>
          </div>

          <div className="rounded-[6px] border border-border bg-surface overflow-hidden shadow-xs">
            <div className="grid grid-cols-12 p-3 bg-surface-subtle border-b border-border text-xs font-semibold text-content-primary">
              <div className="col-span-4">Evaluation Dimension</div>
              <div className="col-span-4 text-content-muted">Generic AI Chatbots</div>
              <div className="col-span-4 text-accent">DocuMind Research Desk</div>
            </div>

            <div className="divide-y divide-border text-xs">
              <div className="grid grid-cols-12 p-3.5 items-center">
                <div className="col-span-4 font-medium text-content-primary">
                  Source Grounding
                </div>
                <div className="col-span-4 text-content-secondary pr-2">
                  Diffuse web training memory with potential confabulation
                </div>
                <div className="col-span-4 text-content-primary font-medium text-accent">
                  Strictly bounded by your uploaded documents
                </div>
              </div>

              <div className="grid grid-cols-12 p-3.5 items-center">
                <div className="col-span-4 font-medium text-content-primary">
                  Citation Verification
                </div>
                <div className="col-span-4 text-content-secondary pr-2">
                  Model invents numbers or cites nonexistent pages
                </div>
                <div className="col-span-4 text-content-primary font-medium text-accent">
                  Server-side check verifies every [N] token against retrieved chunks
                </div>
              </div>

              <div className="grid grid-cols-12 p-3.5 items-center">
                <div className="col-span-4 font-medium text-content-primary">
                  Source Evidence Inspectability
                </div>
                <div className="col-span-4 text-content-secondary pr-2">
                  No direct passage or document viewer link
                </div>
                <div className="col-span-4 text-content-primary font-medium text-accent">
                  Dual-tab inspector jumps to exact quoted passage in PDF reader
                </div>
              </div>

              <div className="grid grid-cols-12 p-3.5 items-center">
                <div className="col-span-4 font-medium text-content-primary">
                  Insufficient Context
                </div>
                <div className="col-span-4 text-content-secondary pr-2">
                  Fills information gaps with plausible speculation
                </div>
                <div className="col-span-4 text-content-primary font-medium text-accent">
                  Truthful refusal notice with citations withheld
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live System Limits Banner */}
      {config && (
        <section className="py-12 border-t border-border bg-surface">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-content-muted font-semibold">
              Live System Limits (Reported by Active Engine)
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-[5px] bg-surface-subtle border border-border">
                Max Upload: {config.max_file_size_mb} MB
              </span>
              <span className="px-3 py-1.5 rounded-[5px] bg-surface-subtle border border-border">
                Chunk Window: {config.default_chunk_size} tokens
              </span>
              <span className="px-3 py-1.5 rounded-[5px] bg-surface-subtle border border-border">
                Overlap: {config.default_chunk_overlap} tokens
              </span>
              <span className="px-3 py-1.5 rounded-[5px] bg-surface-subtle border border-border">
                Formats: {config.allowed_extensions.join(", ")}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-10 px-4 sm:px-8 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-content-secondary">
          <div className="flex items-center gap-2">
            <BrandMark size={16} className="text-accent" />
            <span className="font-semibold text-content-primary">DocuMind AI</span>
            <span>•</span>
            <span>Verifiable Document Intelligence</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-content-secondary">
            <Link to="/workspace" className="hover:text-content-primary transition-colors">
              Workspace
            </Link>
            <Link to="/docs" className="hover:text-content-primary transition-colors">
              Documentation
            </Link>
            <Link to="/settings" className="hover:text-content-primary transition-colors">
              Settings
            </Link>
            <Link to="/privacy" className="hover:text-content-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-content-primary transition-colors">
              Terms
            </Link>
            <Link to="/design-system" className="hover:text-content-primary transition-colors">
              Design System
            </Link>
            <a
              href="https://github.com/harshchavan009/Document-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-content-primary transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
