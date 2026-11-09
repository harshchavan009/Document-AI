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
  ChevronDown,
  Quote,
  Sun,
  Moon,
  Clock,
  Trash2,
  Download,
  MessageSquare,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { BrandWordmark, BrandMark } from "../components/ui/BrandMark";
import { useTheme } from "../context/ThemeContext";
import { api } from "../api/client";
import { usePageMeta } from "../hooks/usePageMeta";
import { LandingTryWidget } from "../components/landing/LandingTryWidget";
import { FeedbackModal } from "../components/ui/FeedbackModal";

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
  usePageMeta(
    "DocuMind AI: Grounded Document Intelligence",
    "DocuMind AI is an intelligent document research platform providing verified answers grounded in PDF and text documents with page-level citations."
  );

  const [config, setConfig] = useState(null);
  const [ready, setReady] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cfg, rdy] = await Promise.all([
          api.getConfig().catch(() => null),
          api.getReady().catch(() => null),
        ]);
        if (cfg) setConfig(cfg);
        if (rdy) setReady(rdy);
      } catch (err) {
        console.error("Failed to load landing data:", err);
      }
    }
    loadData();
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqItems = [
    {
      q: "How does server-side citation verification work?",
      a: "When the AI generates an answer, it emits bracketed numbers like [1] or [2]. Before the response is finalized or shown to you, DocuMind checks every citation token against the text chunks retrieved from your active documents. If a citation points to a chunk that was not retrieved or does not exist, the server automatically strips the bracketed token so you never see fabricated references.",
    },
    {
      q: "Are my documents kept permanently?",
      a: "No. Your documents and vector indices are stored in a private visitor session and automatically purged after 7 days of inactivity. You can also export everything as a zip archive or click Delete all my data in Settings at any time to remove your files immediately.",
    },
    {
      q: "Can I upload scanned documents without text?",
      a: "DocuMind currently indexes digital PDF files and plain text documents with extractable text layers. Pure image scans without an embedded OCR text layer cannot be indexed yet, and the uploader will reject them honestly.",
    },
    {
      q: "Who processes my document text?",
      a: "Your text chunks and questions are sent securely to the Google Gemini API solely for computing vector embeddings and generating grounded answers. Google does not use your uploaded text to train public AI models.",
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-content-primary flex flex-col">
      {/* Top Navigation */}
      <header className="h-14 border-b border-border bg-surface/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center" title="DocuMind AI Home">
          <BrandWordmark size={19} />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-content-secondary">
          <a href="#how-it-works" className="hover:text-content-primary transition-colors">
            How it works
          </a>
          <a href="#verify" className="hover:text-content-primary transition-colors">
            Citations
          </a>
          <a href="#capabilities" className="hover:text-content-primary transition-colors">
            Capabilities & Limits
          </a>
          <a href="#privacy-overview" className="hover:text-content-primary transition-colors">
            Privacy & Retention
          </a>
          <Link to="/docs" className="hover:text-content-primary transition-colors">
            Documentation
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://github.com/harshchavan009/Document-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition-colors hidden sm:inline-flex"
            title="GitHub Repository"
            aria-label="GitHub Repository"
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
            <Button size="sm">Open workspace</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section: Two-Column Editorial Layout */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Outcome Headline & Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-content-primary leading-[1.14]">
                Ask your documents.
                <br />
                <span className="text-accent">See the page that answers.</span>
              </h1>

              <p className="text-sm sm:text-base text-content-secondary leading-relaxed max-w-xl font-sans">
                Upload your research papers and PDFs. Get clear answers backed by exact paragraph citations you can click and verify on the original page.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link to="/workspace">
                <Button size="lg" icon={ArrowRight}>
                  Open workspace
                </Button>
              </Link>
              <Link to="/docs">
                <Button size="lg" variant="secondary" icon={BookOpen}>
                  Documentation
                </Button>
              </Link>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-content-muted">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                Page-level citations
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                7-day private retention
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                No registration required
              </span>
            </div>
          </div>

          {/* Right Column: Live Interactive Onboarding Widget */}
          <div className="lg:col-span-6">
            <LandingTryWidget config={config} />
          </div>
        </div>
      </section>

      {/* Section 1: How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
              The Research Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-content-primary">
              How DocuMind extracts and verifies knowledge
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              Document extraction, vector retrieval, and citation validation are inspectable at every step. Answers are synthesized by Google Gemini strictly from retrieved chunks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-[6px] border border-border bg-canvas space-y-3">
              <div className="w-7 h-7 rounded-[4px] bg-accent-subtle/80 text-accent flex items-center justify-center font-bold text-xs font-mono">
                1
              </div>
              <h3 className="text-sm font-semibold text-content-primary">
                Upload & Extract
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                PyMuPDF extracts text page by page while maintaining exact page coordinate boundaries for every paragraph.
              </p>
            </div>

            <div className="p-5 rounded-[6px] border border-border bg-canvas space-y-3">
              <div className="w-7 h-7 rounded-[4px] bg-accent-subtle/80 text-accent flex items-center justify-center font-bold text-xs font-mono">
                2
              </div>
              <h3 className="text-sm font-semibold text-content-primary">
                Sentence Chunking
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Text is segmented along grammatical sentence boundaries and indexed as dense vector embeddings on persistent disk.
              </p>
            </div>

            <div className="p-5 rounded-[6px] border border-border bg-canvas space-y-3">
              <div className="w-7 h-7 rounded-[4px] bg-accent-subtle/80 text-accent flex items-center justify-center font-bold text-xs font-mono">
                3
              </div>
              <h3 className="text-sm font-semibold text-content-primary">
                Grounded Retrieval
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Cosine similarity locates the most relevant source passages across your chosen documents.
              </p>
            </div>

            <div className="p-5 rounded-[6px] border border-border bg-canvas space-y-3">
              <div className="w-7 h-7 rounded-[4px] bg-accent-subtle/80 text-accent flex items-center justify-center font-bold text-xs font-mono">
                4
              </div>
              <h3 className="text-sm font-semibold text-content-primary">
                Citation Checks
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Every citation token is checked server-side against retrieved chunks, removing any ungrounded references.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Check Every Answer (Core Differentiator with Real Screenshot) */}
      <section id="verify" className="py-16 sm:py-24 border-t border-border bg-canvas">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
                Authentic Verification
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-content-primary leading-tight">
                Click any citation. See the exact paragraph.
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                Generic chatbots synthesize text from diffuse memory and frequently invent page numbers. DocuMind checks every bracketed citation token on the server against your indexed chunks.
              </p>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                Clicking an inline citation chip slides open the evidence inspector, jumps to the exact page, and highlights the cited sentence.
              </p>
              <div className="pt-2">
                <Link to="/workspace">
                  <Button size="sm" icon={ArrowRight}>
                    Try with your own documents
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-[8px] border border-border bg-surface p-2 shadow-sm overflow-hidden">
                <img
                  src="/landing/research_citation_preview.png"
                  alt="DocuMind AI research view with inline citations and split PDF reader"
                  className="rounded-[6px] w-full h-auto border border-border/70"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Works Across Multiple Documents */}
      <section className="py-16 sm:py-20 border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="rounded-[8px] border border-border bg-canvas p-2 shadow-sm overflow-hidden">
                <img
                  src="/landing/document_library_preview.png"
                  alt="DocuMind AI document library table with sorting and batch selection"
                  className="rounded-[6px] w-full h-auto border border-border/70"
                />
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4 text-left order-1 lg:order-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
                Library Synthesis
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-content-primary leading-tight">
                Synthesize findings across several sources
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                Research is rarely confined to one file. Select any combination of papers, reports, or articles in your library to ask questions that compare methodologies, compare conclusions, and track ideas across authors.
              </p>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                Our property table organizes your collection with sorting, multi-select, and live processing stage feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: What DocuMind Can and Cannot Do (Honest Limits) */}
      <section id="capabilities" className="py-16 sm:py-20 border-t border-border bg-canvas">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="space-y-2 text-left">
            <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
              Honest Boundaries
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-content-primary">
              What it can and cannot do
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              We describe system boundaries plainly so researchers know when to use DocuMind and when to double check.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-[6px] border border-border bg-surface space-y-2">
              <div className="flex items-center gap-2 font-semibold text-content-primary">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span>Supported Formats</span>
              </div>
              <p className="text-content-secondary leading-relaxed">
                PDF and plain text documents (`.pdf`, `.txt`) up to {config?.max_file_size_mb || 20} MB and {config?.max_pdf_pages || 50} pages per document.
              </p>
            </div>

            <div className="p-4 rounded-[6px] border border-border bg-surface space-y-2">
              <div className="flex items-center gap-2 font-semibold text-content-primary">
                <AlertCircle className="w-4 h-4 text-semantic-warning-text shrink-0" />
                <span>Scanned Image PDFs</span>
              </div>
              <p className="text-content-secondary leading-relaxed">
                PDFs must contain an embedded digital text layer. Scanned images without OCR are rejected honestly with a clear error explanation.
              </p>
            </div>

            <div className="p-4 rounded-[6px] border border-border bg-surface space-y-2">
              <div className="flex items-center gap-2 font-semibold text-content-primary">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span>Server Citation Filtering</span>
              </div>
              <p className="text-content-secondary leading-relaxed">
                Every citation token is verified against retrieved chunks. Unverified citation numbers are stripped before the response renders.
              </p>
            </div>

            <div className="p-4 rounded-[6px] border border-border bg-surface space-y-2">
              <div className="flex items-center gap-2 font-semibold text-content-primary">
                <AlertCircle className="w-4 h-4 text-semantic-warning-text shrink-0" />
                <span>Verification Responsibility</span>
              </div>
              <p className="text-content-secondary leading-relaxed">
                AI answers can misinterpret subtle context. Citations link directly to the source page so you can verify critical facts yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Your Documents and Privacy */}
      <section id="privacy-overview" className="py-16 sm:py-20 border-t border-border bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="space-y-2 text-left">
            <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
              Privacy by Design
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-content-primary">
              Your documents and private retention
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              We treat uploaded research as private work. Here is exactly what happens to your files.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="p-4 rounded-[6px] border border-border bg-canvas space-y-2">
              <div className="flex items-center gap-2 font-semibold text-content-primary">
                <Lock className="w-4 h-4 text-accent shrink-0" />
                <span>Isolated Sessions</span>
              </div>
              <p className="text-content-secondary leading-relaxed">
                Documents are scoped to a secure, httpOnly visitor session cookie. No user can access or view another visitor's files or chats.
              </p>
            </div>

            <div className="p-4 rounded-[6px] border border-border bg-canvas space-y-2">
              <div className="flex items-center gap-2 font-semibold text-content-primary">
                <Clock className="w-4 h-4 text-accent shrink-0" />
                <span>7-Day Automatic Purge</span>
              </div>
              <p className="text-content-secondary leading-relaxed">
                An automated retention reaper prunes inactive workspaces after {config?.data_retention_days || 7} days. Nothing is stored indefinitely.
              </p>
            </div>

            <div className="p-4 rounded-[6px] border border-border bg-canvas space-y-2">
              <div className="flex items-center gap-2 font-semibold text-content-primary">
                <Trash2 className="w-4 h-4 text-accent shrink-0" />
                <span>Instant Data Erasure</span>
              </div>
              <p className="text-content-secondary leading-relaxed">
                Click Delete all my data in Settings anytime to immediately delete database rows, disk files, and vector embeddings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Frequently Asked Questions */}
      <section className="py-16 sm:py-20 border-t border-border bg-canvas">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-content-primary">
              Frequently asked questions
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary">
              Common questions about document research, citations, and data handling.
            </p>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {faqItems.map((item, idx) => (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold text-content-primary gap-4 cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-content-muted shrink-0 transition-transform ${
                      openFaq === idx ? "rotate-180 text-accent" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <p className="pt-2 text-xs text-content-secondary leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Final Pre-Footer Call to Action */}
      <section className="py-16 sm:py-20 border-t border-border bg-surface-subtle/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6">
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-content-primary">
              Ready to verify your research?
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              Upload your documents or explore the foundational Transformer paper in seconds. No account required.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/workspace">
              <Button size="lg" icon={ArrowRight}>
                Open workspace
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="secondary" icon={BookOpen}>
                Read technical documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-12 px-4 sm:px-8 mt-auto text-xs text-content-secondary">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BrandMark size={16} className="text-accent" />
                <span className="font-semibold text-content-primary">DocuMind AI</span>
              </div>
              <p className="text-[11px] text-content-muted">
                Your documents. Understood intelligently.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <Link to="/workspace" className="hover:text-content-primary transition-colors">
                Workspace
              </Link>
              <Link to="/docs" className="hover:text-content-primary transition-colors">
                Documentation
              </Link>
              <Link to="/privacy" className="hover:text-content-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-content-primary transition-colors">
                Terms
              </Link>
              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                className="hover:text-content-primary transition-colors cursor-pointer"
              >
                Feedback
              </button>
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

          <div className="space-y-2 text-[11px] text-content-muted">
            <p>
              Sample document: Vaswani et al. (2017), Attention Is All You Need, arXiv:1706.03762. Sourced under the arXiv non-exclusive distribution license for scholarly demonstration with attribution.
            </p>
            <p>
              DocuMind AI uses Google Gemini API for dense vector embeddings and answer synthesis.
            </p>
          </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
