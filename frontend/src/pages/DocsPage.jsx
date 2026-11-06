import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Cpu,
  ShieldCheck,
  Database,
  FileText,
  Search,
  Code2,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Layers,
  Terminal,
  Server,
  Lock,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { BrandWordmark } from "../components/ui/BrandMark";
import { useTheme } from "../context/ThemeContext";
import { api } from "../api/client";

export function DocsPage() {
  const { theme, toggleTheme } = useTheme();
  const [config, setConfig] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await api.getConfig();
        setConfig(data);
      } catch (err) {
        console.error("Could not load config in docs:", err);
      }
    }
    loadConfig();
  }, []);

  const copyCode = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const navSections = [
    {
      group: "Getting Started",
      items: [
        { id: "overview", label: "Overview & Philosophy" },
        { id: "quickstart", label: "Quickstart Workflow" },
      ],
    },
    {
      group: "Architecture & Pipeline",
      items: [
        { id: "ingestion", label: "Ingestion & Extraction" },
        { id: "chunking", label: "Chunking & Token Windows" },
        { id: "vector-store", label: "Embeddings & ChromaDB" },
      ],
    },
    {
      group: "Citation Grounding",
      items: [
        { id: "verification", label: "Server-Side Verification" },
        { id: "boundary", label: "Untrusted Data Boundaries" },
        { id: "refusal", label: "Truthful Refusal Mechanism" },
      ],
    },
    {
      group: "API Reference",
      items: [
        { id: "api-endpoints", label: "Core Endpoints" },
        { id: "runtime-config", label: "Live System Parameters" },
      ],
    },
    {
      group: "Security & Storage",
      items: [
        { id: "session-isolation", label: "Visitor Identity Model" },
        { id: "deletion-lifecycle", label: "Data Purging & Lifecycle" },
      ],
    },
  ];

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filteredNav = searchQuery.trim()
    ? navSections
        .map((g) => ({
          ...g,
          items: g.items.filter((i) =>
            i.label.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((g) => g.items.length > 0)
    : navSections;

  return (
    <div className="min-h-screen bg-canvas text-content-primary flex flex-col">
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-surface px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center mr-2">
            <BrandWordmark size={18} />
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-content-secondary">
            <span>Documentation</span>
            <ChevronRight className="w-3 h-3 text-content-muted" />
            <span className="font-medium text-content-primary capitalize">
              {activeSection.replace("-", " ")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {/* 3-Column Stripe-Style Documentation Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto overflow-hidden">
        {/* Left Column: Sticky Table of Contents */}
        <aside className="w-64 border-r border-border bg-surface hidden md:flex flex-col shrink-0 p-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          {/* Documentation Search Filter */}
          <div className="relative mb-4">
            <Search className="w-3.5 h-3.5 text-content-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-2.5 text-xs bg-canvas border border-border rounded-[5px] text-content-primary placeholder:text-content-muted focus:outline-none focus:border-accent"
            />
          </div>

          <nav className="space-y-5 text-xs">
            {filteredNav.map((group) => (
              <div key={group.group} className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted font-semibold block px-2 mb-1">
                  {group.group}
                </span>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    className={`w-full text-left px-2 py-1.5 rounded-[4px] transition-colors cursor-pointer block ${
                      activeSection === item.id
                        ? "bg-accent-subtle/80 text-content-primary font-semibold border-l-2 border-accent pl-2"
                        : "text-content-secondary hover:text-content-primary hover:bg-surface-subtle"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* Center Column: Reading Content */}
        <main className="flex-1 min-w-0 p-6 sm:p-10 lg:p-12 overflow-y-auto space-y-12 max-w-[76ch]">
          {/* Section: Overview & Philosophy */}
          <section id="overview" className="space-y-4 scroll-mt-20">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-accent-subtle/60 border border-accent/20 text-accent font-mono text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Architectural Principles</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-content-primary tracking-tight">
              Overview & Research Philosophy
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed font-sans">
              DocuMind AI is designed as a tool-grade research desk for literature analysis, clinical trials, and technical documentation. Unlike consumer chatbots that synthesize answers from diffuse training memory, DocuMind AI enforces <strong>strict retrieval grounding</strong>. Every factual claim must originate from an indexed document chunk in your active workspace, and all citations are verified server-side before display.
            </p>
          </section>

          {/* Section: Quickstart Workflow */}
          <section id="quickstart" className="space-y-4 scroll-mt-20 border-t border-border pt-8">
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-content-primary">
              Quickstart Workflow
            </h2>
            <ol className="space-y-3 text-xs sm:text-sm text-content-secondary leading-relaxed list-decimal list-inside">
              <li>
                <strong>Ingest Documents:</strong> Navigate to the <Link to="/workspace/documents" className="text-accent hover:underline font-medium">Document Library</Link> and upload genuine PDF or TXT files, or click <em>Load Sample Paper</em> to ingest the bundled academic paper.
              </li>
              <li>
                <strong>Scope Research:</strong> In the <Link to="/workspace/research" className="text-accent hover:underline font-medium">Research Canvas</Link>, select one or more ready documents in the left Source Scope checklist.
              </li>
              <li>
                <strong>Ask Questions:</strong> Select one of the dynamic suggested inquiries or formulate your own research query. The engine streams the answer with inline citations.
              </li>
              <li>
                <strong>Inspect Evidence:</strong> Click any citation marker <span className="inline-block px-1 bg-citation border border-citation-border text-citation-text font-bold text-[10px] rounded-[3px]">[1]</span> to open the Evidence Inspector or jump to the exact cited page in the embedded document reader.
              </li>
            </ol>
          </section>

          {/* Section: Ingestion & Extraction */}
          <section id="ingestion" className="space-y-4 scroll-mt-20 border-t border-border pt-8">
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-content-primary">
              Ingestion & Magic-Byte Validation
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              File uploads undergo defensive validation before disk persistence. The system verifies extension whitelisting, evaluates file size against server limits, and validates binary signatures:
            </p>

            <div className="rounded-[6px] border border-border bg-surface p-4 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-border/60 text-content-muted">
                <span>Validation Rule</span>
                <span>Enforcement Method</span>
              </div>
              <div className="flex items-center justify-between">
                <span>PDF Magic Bytes</span>
                <span className="text-content-secondary">%PDF- (first 5 bytes)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Plain Text Validation</span>
                <span className="text-content-secondary">Strict UTF-8 byte stream decode</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Storage Path Isolation</span>
                <span className="text-content-secondary">UUID filename, sanitized base</span>
              </div>
            </div>
          </section>

          {/* Section: Chunking & Token Windows */}
          <section id="chunking" className="space-y-4 scroll-mt-20 border-t border-border pt-8">
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-content-primary">
              Chunking & Token Windows
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              Extracted text is partitioned using sentence boundary detection. Each chunk is tagged with its origin page number, character offset range, and sequential chunk index to allow exact coordinate jumping.
            </p>

            {/* Live Runtime Config Table */}
            <div className="rounded-[6px] border border-border bg-surface overflow-hidden text-xs">
              <div className="p-3 bg-surface-subtle border-b border-border font-semibold text-content-primary">
                Active System Chunking Configuration (Live from API)
              </div>
              <div className="p-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-content-muted block text-[11px]">Chunk Size:</span>
                  <span className="font-mono text-content-primary font-semibold tabular-nums">
                    {config ? `${config.default_chunk_size} tokens` : "Loading..."}
                  </span>
                </div>
                <div>
                  <span className="text-content-muted block text-[11px]">Chunk Overlap:</span>
                  <span className="font-mono text-content-primary font-semibold tabular-nums">
                    {config ? `${config.default_chunk_overlap} tokens` : "Loading..."}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Embeddings & ChromaDB */}
          <section id="vector-store" className="space-y-4 scroll-mt-20 border-t border-border pt-8">
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-content-primary">
              Embeddings & ChromaDB Persistence
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              Dense vector embeddings are computed via Google Gen AI using the task-optimized <code className="font-mono text-accent text-xs">{config?.embedding_model || "gemini-embedding-001"}</code> model. Vectors are stored in a disk-persisted ChromaDB collection with cosine distance indexing.
            </p>

            {/* ASCII / Monospace Architecture Diagram */}
            <div className="rounded-[6px] border border-border bg-surface p-4 text-[11px] font-mono text-content-secondary leading-relaxed overflow-x-auto">
              <pre>{`User Query
    │
    ▼
Embed Query (RETRIEVAL_QUERY) ──► ChromaDB Cosine Search
                                         │
                                         ▼
                              Top-K Scoped Chunks
                                         │
                                         ▼
                             Untrusted Boundary Prompt
                                         │
                                         ▼
                              Gemini 2.5 Flash
                                         │
                                         ▼
                           Raw Text with Tokens [1], [2]
                                         │
                                         ▼
                       Server-Side Citation Validator
                                         │
                             ┌───────────┴───────────┐
                             ▼                       ▼
                      Valid Citation       Hallucinated Token
                      (Retained)           (Stripped Server-Side)
                             │
                             ▼
                    Client Verified Synthesis`}</pre>
            </div>
          </section>

          {/* Section: Server-Side Citation Validation */}
          <section id="verification" className="space-y-4 scroll-mt-20 border-t border-border pt-8">
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-content-primary">
              Server-Side Citation Validation
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              Standard RAG systems trust the LLM to output accurate citations. In contrast, DocuMind AI executes server-side validation on every response. The backend inspects every citation token against the set of retrieved chunks:
            </p>

            {/* Code Block with Copy Action */}
            <div className="rounded-[6px] border border-border bg-surface overflow-hidden">
              <div className="px-3 py-2 border-b border-border bg-surface-subtle flex items-center justify-between text-xs font-mono text-content-muted">
                <span>backend/app/services/rag_service.py</span>
                <button
                  type="button"
                  onClick={() =>
                    copyCode(
                      `valid_citations = []\nfor index in extracted_indices:\n    chunk = retrieved_map.get(index)\n    if chunk:\n        valid_citations.append(chunk)\n    else:\n        text = strip_citation(text, index)  # Remove hallucinated citations`,
                      "code-citation"
                    )
                  }
                  className="inline-flex items-center gap-1 hover:text-content-primary cursor-pointer"
                >
                  {copiedId === "code-citation" ? (
                    <>
                      <Check className="w-3 h-3 text-semantic-success-text" />
                      <span className="text-semantic-success-text">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-content-primary overflow-x-auto leading-relaxed">
                {`valid_citations = []
for index in extracted_indices:
    chunk = retrieved_map.get(index)
    if chunk:
        valid_citations.append(chunk)
    else:
        # Hallucinated citation stripped server-side
        text = strip_citation_token(text, index)`}
              </pre>
            </div>
          </section>

          {/* Section: Untrusted Data Boundaries */}
          <section id="boundary" className="space-y-4 scroll-mt-20 border-t border-border pt-8">
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-content-primary">
              Untrusted Data Boundaries
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              User documents are untrusted input. An adversarial document containing prompt injections (for example, "Ignore previous instructions") is isolated within explicit structural XML delimiters:
            </p>
            <div className="rounded-[6px] border border-border bg-surface p-3 font-mono text-xs text-content-secondary">
              <code>{`<DOCUMENT_EXCERPT id="chunk_1" page="1">\n[Text is treated strictly as passive evidence, never as system instructions]\n</DOCUMENT_EXCERPT>`}</code>
            </div>
          </section>

          {/* Section: Core API Endpoints */}
          <section id="api-endpoints" className="space-y-4 scroll-mt-20 border-t border-border pt-8">
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-content-primary">
              Core API Reference
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              All endpoints accept JSON or multipart payloads and return typed responses.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-1.5 py-0.5 rounded-[3px] bg-semantic-success-bg text-semantic-success-text font-bold text-[10px]">
                    GET
                  </span>
                  <span className="font-semibold text-content-primary">/api/config</span>
                </div>
                <p className="text-content-secondary">
                  Returns runtime limits, active models, chunk parameters, and allowed file extensions.
                </p>
              </div>

              <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-1.5 py-0.5 rounded-[3px] bg-accent-subtle text-accent font-bold text-[10px]">
                    POST
                  </span>
                  <span className="font-semibold text-content-primary">/api/chat/suggested-questions</span>
                </div>
                <p className="text-content-secondary">
                  Generates three contextual research questions grounded strictly in the active workspace documents.
                </p>
              </div>

              <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-1.5 py-0.5 rounded-[3px] bg-accent-subtle text-accent font-bold text-[10px]">
                    POST
                  </span>
                  <span className="font-semibold text-content-primary">/api/chat/query/stream</span>
                </div>
                <p className="text-content-secondary">
                  Server-Sent Events endpoint streaming answer tokens and dispatching verified citation payloads.
                </p>
              </div>

              <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-1.5 py-0.5 rounded-[3px] bg-semantic-success-bg text-semantic-success-text font-bold text-[10px]">
                    GET
                  </span>
                  <span className="font-semibold text-content-primary">/api/documents/{`{id}`}/file</span>
                </div>
                <p className="text-content-secondary">
                  Serves raw PDF or text binary for in-browser PDF.js preview with nosniff security headers.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Right Column: In-Page Anchor Index */}
        <aside className="w-56 hidden lg:block p-6 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto shrink-0 border-l border-border/60">
          <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted font-semibold block mb-3">
            On This Page
          </span>
          <nav className="space-y-2 text-[11px]">
            <a
              href="#overview"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("overview");
              }}
              className="text-content-secondary hover:text-accent block transition-colors"
            >
              Overview & Philosophy
            </a>
            <a
              href="#quickstart"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("quickstart");
              }}
              className="text-content-secondary hover:text-accent block transition-colors"
            >
              Quickstart Workflow
            </a>
            <a
              href="#ingestion"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("ingestion");
              }}
              className="text-content-secondary hover:text-accent block transition-colors"
            >
              Ingestion & Magic Bytes
            </a>
            <a
              href="#chunking"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("chunking");
              }}
              className="text-content-secondary hover:text-accent block transition-colors"
            >
              Chunking & Token Windows
            </a>
            <a
              href="#vector-store"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("vector-store");
              }}
              className="text-content-secondary hover:text-accent block transition-colors"
            >
              Embeddings & ChromaDB
            </a>
            <a
              href="#verification"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("verification");
              }}
              className="text-content-secondary hover:text-accent block transition-colors"
            >
              Citation Validation
            </a>
            <a
              href="#boundary"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("boundary");
              }}
              className="text-content-secondary hover:text-accent block transition-colors"
            >
              Untrusted Data Boundary
            </a>
            <a
              href="#api-endpoints"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("api-endpoints");
              }}
              className="text-content-secondary hover:text-accent block transition-colors"
            >
              API Reference
            </a>
          </nav>
        </aside>
      </div>
    </div>
  );
}
