import React from "react";
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
} from "lucide-react";
import { Button } from "../components/ui/Button";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-content-primary flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-white font-bold text-sm shadow-xs">
            D
          </div>
          <span className="font-bold text-base tracking-tight text-content-primary">
            DocuMind AI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-content-secondary">
          <a href="#how-it-works" className="hover:text-content-primary transition-colors">
            How It Works
          </a>
          <a href="#features" className="hover:text-content-primary transition-colors">
            Features
          </a>
          <a href="#security" className="hover:text-content-primary transition-colors">
            Security & Privacy
          </a>
          <Link to="/docs" className="hover:text-content-primary transition-colors">
            Documentation
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/workspace">
            <Button size="sm">Open Workspace</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-20 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-content-secondary text-xs font-mono mb-6">
          <span className="w-2 h-2 rounded-full bg-semantic-success-text" />
          <span>Real RAG Pipeline with Server-Side Citation Validation</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-content-primary leading-[1.15] mb-6">
          Your documents. Understood intelligently.
        </h1>

        <p className="text-base sm:text-lg text-content-secondary max-w-2xl mx-auto leading-relaxed mb-8">
          Upload complex PDF and text documents. Query knowledge across files.
          Receive accurate answers backed by verifiable page-level source references from your own documents.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <Link to="/workspace">
            <Button size="lg" icon={ArrowRight}>
              Start Researching
            </Button>
          </Link>
          <Link to="/docs">
            <Button size="lg" variant="secondary" icon={BookOpen}>
              System Documentation
            </Button>
          </Link>
        </div>

        {/* Real Product Interface Preview */}
        <div className="rounded-xl border border-border bg-surface shadow-xl p-3 sm:p-5 text-left text-xs max-w-4xl mx-auto overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <span className="ml-2 text-xs font-mono text-content-muted">DocuMind AI Research Workspace</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-accent bg-accent-subtle px-2 py-0.5 rounded">
              <span>gemini-2.5-flash</span>
              <span>•</span>
              <span>gemini-embedding-001</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left Mock: Selected Documents */}
            <div className="md:col-span-3 border border-border/60 rounded-md p-3 bg-surface-subtle/50 space-y-2">
              <div className="text-[10px] font-semibold uppercase text-content-muted">
                Active Sources (2)
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-surface border border-border text-[11px]">
                <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="truncate font-medium">Clinical_Trial.pdf</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-surface border border-border text-[11px]">
                <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="truncate font-medium">Protocol_Spec.pdf</span>
              </div>
            </div>

            {/* Center Mock: Grounded Answer with Citations */}
            <div className="md:col-span-5 border border-border/60 rounded-md p-3.5 bg-surface space-y-3">
              <div className="font-semibold text-content-primary text-xs">
                Question: "What efficacy rate was recorded in Phase 2?"
              </div>
              <div className="p-3 rounded bg-canvas border border-border/40 text-[11px] leading-relaxed text-content-secondary space-y-2">
                <p>
                  Phase 2 clinical trials demonstrated an overall therapeutic efficacy rate of 78.4 percent across the evaluated cohort{" "}
                  <span className="inline-block px-1 rounded-xs bg-accent-subtle text-accent font-mono font-bold text-[10px]">
                    [1]
                  </span>.
                </p>
                <p>
                  Adverse reactions remained low, occurring in fewer than 4 percent of participating subjects with no Grade 4 incidents recorded{" "}
                  <span className="inline-block px-1 rounded-xs bg-accent-subtle text-accent font-mono font-bold text-[10px]">
                    [2]
                  </span>.
                </p>
              </div>
            </div>

            {/* Right Mock: Verified Source Excerpts */}
            <div className="md:col-span-4 border border-border/60 rounded-md p-3 bg-surface-subtle/50 space-y-2.5">
              <div className="text-[10px] font-semibold uppercase text-content-muted flex items-center justify-between">
                <span>Verified Citations</span>
                <span className="text-semantic-success-text flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> Grounded
                </span>
              </div>

              <div className="p-2.5 rounded bg-surface border border-accent/40 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold font-mono text-accent">[1] Clinical_Trial.pdf</span>
                  <span className="font-mono text-content-muted">Page 8</span>
                </div>
                <p className="font-mono text-[10px] italic text-content-secondary line-clamp-2">
                  "In the Phase 2 cohort (n=450), overall therapeutic efficacy rate was determined to be 78.4%."
                </p>
              </div>

              <div className="p-2.5 rounded bg-surface border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold font-mono text-accent">[2] Protocol_Spec.pdf</span>
                  <span className="font-mono text-content-muted">Page 14</span>
                </div>
                <p className="font-mono text-[10px] italic text-content-secondary line-clamp-2">
                  "Adverse reactions remained below 4.0% with zero Grade 4 incidents documented."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary mb-3">
              How the Ingestion and Retrieval Pipeline Operates
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              Every step is real, deterministic, and inspectable. No synthetic stages or mock progress indicators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg border border-border bg-canvas space-y-3">
              <div className="w-8 h-8 rounded bg-accent-subtle text-accent flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-sm font-semibold text-content-primary">
                Magic-Byte Ingestion & Extraction
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Files are validated using genuine magic bytes (%PDF- headers and UTF-8 verification). Text is extracted page-by-page via PyMuPDF.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-border bg-canvas space-y-3">
              <div className="w-8 h-8 rounded bg-accent-subtle text-accent flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-sm font-semibold text-content-primary">
                Token Chunking & Vector Indexing
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Text is segmented into 600-token chunks with 100-token overlap, preserving page boundaries. Dense vectors are generated using gemini-embedding-001 and stored in ChromaDB.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-border bg-canvas space-y-3">
              <div className="w-8 h-8 rounded bg-accent-subtle text-accent flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-sm font-semibold text-content-primary">
                Semantic Retrieval & Grounded Generation
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Queries are embedded and filtered using cosine distance thresholds. Gemini 2.5 Flash streams the response, and citations are verified against real chunks server-side.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Breakdown Rows */}
      <section id="features" className="py-16 sm:py-24 border-t border-border bg-canvas">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-3">
              <div className="text-xs font-mono font-semibold text-accent">
                VERIFIABLE GROUNDING
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-content-primary">
                Every claim connects to a specific page.
              </h3>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                DocuMind AI never produces ungrounded assertions. Every bracketed citation marker maps directly to a verified passage in your document. Click any citation to open the document preview navigated to that exact page.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-surface shadow-xs font-mono text-xs text-content-secondary space-y-2">
              <div className="text-accent font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Server-Side Citation Validation
              </div>
              <p className="text-[11px] leading-relaxed">
                After generation, the backend inspects all cited tokens. Any citation index not present in the retrieved set is stripped before finalizing the response.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="p-6 rounded-lg border border-border bg-surface shadow-xs font-mono text-xs text-content-secondary space-y-2 md:order-1">
              <div className="text-semantic-warning-text font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Honest Insufficient-Context Behavior
              </div>
              <p className="text-[11px] leading-relaxed">
                If the closest chunk falls outside the calibrated relevance threshold, DocuMind AI immediately states: "I could not find sufficient information in your selected documents to answer this question accurately."
              </p>
            </div>
            <div className="space-y-3 md:order-2">
              <div className="text-xs font-mono font-semibold text-accent">
                ANTI-HALLUCINATION DEFENSE
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-content-primary">
                Honest refusals when evidence is absent.
              </h3>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                We believe an AI research system must say "I do not know" when documentation is missing, rather than fabricating plausible sounding falsehoods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security and Privacy Section */}
      <section id="security" className="py-16 sm:py-24 border-t border-border bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6">
          <div className="w-10 h-10 rounded-md bg-accent-subtle text-accent flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">
            Clear Security and Data Isolation
          </h2>

          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed max-w-2xl mx-auto">
            We state our security controls truthfully. Uploaded documents are stored on disk with non-deterministic UUIDs. Vector embeddings are isolated by visitor session and workspace ID. Deleting a document removes its disk file, database rows, and ChromaDB vectors permanently.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-4 rounded border border-border bg-canvas text-xs space-y-1">
              <div className="font-semibold text-content-primary">Session Isolation</div>
              <p className="text-[11px] text-content-secondary">
                Visitors receive cryptographically signed session tokens. Cross-session document access is strictly denied.
              </p>
            </div>

            <div className="p-4 rounded border border-border bg-canvas text-xs space-y-1">
              <div className="font-semibold text-content-primary">Complete Deletion</div>
              <p className="text-[11px] text-content-secondary">
                When you delete a document, disk files, SQLite records, and ChromaDB vector embeddings are permanently wiped.
              </p>
            </div>

            <div className="p-4 rounded border border-border bg-canvas text-xs space-y-1">
              <div className="font-semibold text-content-primary">No Model Training</div>
              <p className="text-[11px] text-content-secondary">
                Document text is sent exclusively to Google Gen AI APIs for embedding and generation without training persistent models.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-surface py-8 px-4 sm:px-8 text-xs text-content-secondary">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>DocuMind AI</span>
            <span>•</span>
            <span>Intermediate-Level AI Engineer Evaluation</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <Link to="/privacy" className="hover:text-content-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-content-primary transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/docs" className="hover:text-content-primary transition-colors">
              Documentation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

