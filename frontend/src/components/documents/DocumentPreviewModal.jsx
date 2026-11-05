import React from "react";
import { Link } from "react-router-dom";
import { X, ExternalLink } from "lucide-react";
import { DocumentReader } from "./DocumentReader";

export function DocumentPreviewModal({
  documentId,
  initialPage = 1,
  targetExcerpt = "",
  onClose,
}) {
  if (!documentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl h-full bg-surface border-l border-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-subtle shrink-0">
          <Link
            to={`/documents/${documentId}`}
            className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Open Dedicated Viewer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface text-content-muted hover:text-content-primary transition-colors"
            aria-label="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Embedded Document Reader */}
        <div className="flex-1 overflow-hidden">
          <DocumentReader
            documentId={documentId}
            initialPage={initialPage}
            highlightExcerpt={targetExcerpt}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
