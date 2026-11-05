import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Cpu, ShieldCheck, Database, FileText, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";

export function DocsPage() {
  return (
    <div className="min-h-screen bg-canvas text-content-primary p-4 sm:p-8 max-w-4xl mx-auto space-y-10 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button size="sm" variant="subtle" icon={ArrowLeft}>
              Back to Home
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-lg font-bold text-content-primary">
            System Documentation
          </h1>
        </div>

        <Link to="/workspace">
          <Button size="sm">Open Workspace</Button>
        </Link>
      </div>

      {/* Overview Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
          <Cpu className="w-5 h-5 text-accent" />
          <span>Architecture & RAG Pipeline</span>
        </h2>
        <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
          DocuMind AI couples a high-performance Python FastAPI backend with a React SPA. It employs the official Google Gen AI Python SDK (google-genai) and ChromaDB persistent vector storage.
        </p>

        <div className="p-4 rounded-lg border border-border bg-surface space-y-3 font-mono text-xs">
          <div className="font-semibold text-content-primary border-b border-border pb-2">
            Key Pipeline Specifications
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-content-secondary">
            <div>
              <span className="text-content-muted">Extraction:</span> PyMuPDF (fitz)
            </div>
            <div>
              <span className="text-content-muted">Chunk Size:</span> 600 tokens (100 overlap)
            </div>
            <div>
              <span className="text-content-muted">Embedding Model:</span> gemini-embedding-001 (768-dim)
            </div>
            <div>
              <span className="text-content-muted">Generation Model:</span> gemini-2.5-flash
            </div>
            <div>
              <span className="text-content-muted">Vector Store:</span> ChromaDB PersistentClient
            </div>
            <div>
              <span className="text-content-muted">Distance Metric:</span> Cosine similarity
            </div>
          </div>
        </div>
      </section>

      {/* Citation Validation Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <span>Server-Side Citation Validation</span>
        </h2>
        <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
          DocuMind AI guarantees zero fabricated sources. When the generation model produces response text containing citation markers like [1] or [2], the backend extracts each bracketed token and verifies that the cited index maps to an actual chunk in the retrieved context set. Any hallucinated citation is stripped before the answer is returned to the client.
        </p>
      </section>

      {/* Dynamic Configuration */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
          <Database className="w-5 h-5 text-accent" />
          <span>Zero Static Data Enforcement</span>
        </h2>
        <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
          All limits (allowed file extensions, maximum file size in megabytes, chunk sizes, and active model identifiers) originate from the backend configuration and are exposed via the public GET /api/config endpoint. The frontend consumes this endpoint directly.
        </p>
      </section>
    </div>
  );
}

