import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileCheck, Sun, Moon } from "lucide-react";
import { Button } from "../components/ui/Button";
import { BrandWordmark } from "../components/ui/BrandMark";
import { useTheme } from "../context/ThemeContext";

export function TermsPage() {
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
            Terms of Service
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
            <FileCheck className="w-3.5 h-3.5" />
            <span>Usage Agreement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-content-primary tracking-tight">
            Terms and Conditions
          </h1>
          <p className="text-xs text-content-muted font-mono">
            Effective Date: November 2026 • Version 1.0
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-content-secondary leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-serif font-semibold text-content-primary">
              1. Permitted Research Use
            </h2>
            <p>
              DocuMind AI provides grounded document intelligence for research, literature review, and study. Users agree to upload only legitimate documentation and research files. Uploading malicious binaries, executables disguised as text, or copyrighted content without authorization is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-serif font-semibold text-content-primary">
              2. Source Citations and Ground Truth Verification
            </h2>
            <p>
              DocuMind AI implements deterministic chunk extraction and server-side citation validation to strip hallucinated citations. However, generative synthesis should always be reviewed against the linked primary source passages before taking critical actions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-serif font-semibold text-content-primary">
              3. Service Limitations and Enforced Boundaries
            </h2>
            <p>
              File uploads are restricted to genuine PDF and TXT documents up to 20 MB each and 50 pages per PDF document. Request rates are limited per IP and visitor session (20 uploads per minute, 30 queries per minute). Workspaces not accessed for more than 7 days are subject to automated data retention purging. The software is provided as-is without representations of uninterrupted uptime or fitness for emergency operations.
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
