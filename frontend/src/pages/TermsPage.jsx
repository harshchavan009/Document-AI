import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileCheck } from "lucide-react";
import { Button } from "../components/ui/Button";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-canvas text-content-primary p-4 sm:p-8 max-w-3xl mx-auto space-y-8 selection:bg-indigo-500 selection:text-white">
      <div className="flex items-center gap-3 pb-6 border-b border-border">
        <Link to="/">
          <Button size="sm" variant="subtle" icon={ArrowLeft}>
            Back to Home
          </Button>
        </Link>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-lg font-bold text-content-primary flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-accent" />
          <span>Terms and Conditions</span>
        </h1>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-content-secondary leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-content-primary">
            1. Acceptable Use
          </h2>
          <p>
            DocuMind AI is provided for research, study, and document analysis. Users must not upload malicious files, executables disguised as text, or content violating copyright or applicable privacy regulations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-content-primary">
            2. AI Responses and Source Verification
          </h2>
          <p>
            While DocuMind AI enforces source-grounded retrieval and server-side citation validation, AI generated answers are intended to assist human analysis. Users should always inspect the linked source citations to verify primary text context for mission-critical decisions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-content-primary">
            3. Availability and Limits
          </h2>
          <p>
            Document file sizes, chunking limits, and rate limitations are enforced by system configuration. The service is provided as-is without warranties of uninterrupted availability.
          </p>
        </section>
      </div>
    </div>
  );
}

