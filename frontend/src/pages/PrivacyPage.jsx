import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "../components/ui/Button";

export function PrivacyPage() {
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
          <Shield className="w-5 h-5 text-accent" />
          <span>Privacy Policy</span>
        </h1>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-content-secondary leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-content-primary">
            1. Document Handling and Storage
          </h2>
          <p>
            When you upload PDF or TXT documents to DocuMind AI, the files are stored on the server using non-deterministic UUID filenames in an isolated storage directory. The original user filename is retained only as metadata in the local SQLite database.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-content-primary">
            2. Third-Party AI Processing
          </h2>
          <p>
            DocuMind AI uses the official Google Gen AI Python SDK. Text segments extracted from your documents are transmitted to Google Gemini API endpoints (gemini-embedding-001 for vector embeddings and gemini-2.5-flash for question answering). In accordance with standard enterprise API terms, data transmitted through paid or sanctioned developer APIs is not used to train foundation models.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-content-primary">
            3. Session Identity and Isolation
          </h2>
          <p>
            To enable document research without mandatory account creation, visitors receive a cryptographically signed cookie (dm_session). All workspaces, documents, vector queries, and conversation records are bound strictly to this session identity. Cross-session access attempts are rejected.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-content-primary">
            4. Data Retention and Permanent Deletion
          </h2>
          <p>
            You retain complete control over your documents. Deleting a document from the Document Library immediately and permanently removes the file from disk, deletes all associated database rows, and purges all corresponding vector embeddings from ChromaDB.
          </p>
        </section>
      </div>
    </div>
  );
}

