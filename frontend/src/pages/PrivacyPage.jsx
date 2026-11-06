import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Sun, Moon } from "lucide-react";
import { Button } from "../components/ui/Button";
import { BrandWordmark } from "../components/ui/BrandMark";
import { useTheme } from "../context/ThemeContext";

export function PrivacyPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-canvas text-content-primary flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border bg-surface px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center mr-2">
            <BrandWordmark size={18} />
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <span className="text-xs text-content-secondary hidden sm:inline">
            Privacy Policy
          </span>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Main Reading Column */}
      <main className="max-w-3xl mx-auto p-6 sm:p-10 space-y-8 flex-1">
        <div className="border-b border-border pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-accent-subtle/60 border border-accent/20 text-accent font-mono text-[11px] font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Data Protection Standards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-content-primary tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-content-muted font-mono">
            Last Updated: November 2026 • DocuMind AI Architecture v1.0
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-content-secondary leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-serif font-semibold text-content-primary">
              1. Document Storage and Cryptographic Isolation
            </h2>
            <p>
              When you upload PDF or TXT documents to DocuMind AI, files are saved locally on the server using non-deterministic UUID filenames in an isolated storage directory. The original user filename is retained only as metadata in the local SQLite database. File system paths are sanitized to prevent directory traversal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-serif font-semibold text-content-primary">
              2. Third-Party AI Engine Processing
            </h2>
            <p>
              DocuMind AI uses the official Google Gen AI Python SDK. Text segments extracted from your documents are transmitted to Google Gemini API endpoints (gemini-embedding-001 for vector embeddings and gemini-2.5-flash for question answering). In accordance with Google API policies for developer keys, data transmitted through API endpoints is not used to train foundation models.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-serif font-semibold text-content-primary">
              3. Session Identity Model
            </h2>
            <p>
              To enable document research without requiring persistent accounts, visitors receive a cryptographically signed cookie (dm_session). All workspaces, documents, vector queries, and conversation records are bound strictly to this session identity. Cross-session access attempts are rejected.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-serif font-semibold text-content-primary">
              4. Data Retention and Permanent Purging
            </h2>
            <p>
              You retain complete control over your data. Deleting a document from the Document Library immediately and permanently removes the file from disk, deletes all associated database rows, and purges all corresponding vector embeddings from ChromaDB. You can also reset your visitor session at any time from the Settings page.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-6 px-4 sm:px-8 text-center text-xs text-content-muted">
        DocuMind AI • Verifiable Document Intelligence Platform
      </footer>
    </div>
  );
}
