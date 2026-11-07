import React from "react";
import { Link } from "react-router-dom";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { usePageMeta } from "../hooks/usePageMeta";

export function NotFoundPage() {
  usePageMeta("Page Not Found", "The requested page could not be located.");

  return (
    <div className="min-h-screen bg-canvas text-content-primary flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center text-content-muted mb-4 shadow-sm">
        <FileQuestion className="w-8 h-8 text-accent" />
      </div>

      <h1 className="text-3xl font-extrabold text-content-primary mb-2">404</h1>
      <h2 className="text-base font-semibold text-content-primary mb-2">
        Page Not Found
      </h2>
      <p className="text-xs text-content-secondary max-w-sm mb-6 leading-relaxed">
        The page or resource you requested could not be located in the workspace.
      </p>

      <Link to="/workspace">
        <Button icon={ArrowLeft}>Return to Workspace</Button>
      </Link>
    </div>
  );
}

