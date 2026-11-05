import React from "react";
import { FileText, ArrowUpRight, CheckCircle2 } from "lucide-react";

export function EvidenceExcerpt({
  citation,
  active = false,
  onOpenPreview,
  className = "",
}) {
  if (!citation) return null;

  const relevanceDisplay =
    citation.relevance_score !== undefined && citation.relevance_score !== null
      ? (1 - Math.min(1, citation.relevance_score)).toFixed(2)
      : null;

  return (
    <div
      id={`evidence-citation-${citation.citation_index}`}
      className={`p-3.5 rounded-md border transition-all ${
        active
          ? "bg-accent-subtle/50 border-accent shadow-sm ring-1 ring-accent"
          : "bg-surface border-border hover:border-border-strong"
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/50 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-xs bg-accent text-white font-mono text-[10px] font-bold shrink-0">
            {citation.citation_index}
          </span>
          <FileText className="w-3.5 h-3.5 text-content-muted shrink-0" />
          <span className="font-medium text-content-primary truncate">
            {citation.filename || "Document"}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-surface-subtle text-content-secondary border border-border">
            Page {citation.page_number || 1}
          </span>
          {relevanceDisplay && (
            <span
              title="Cosine similarity confidence score"
              className="text-[10px] font-mono text-semantic-success-text bg-semantic-success-bg px-1 py-0.5 rounded border border-semantic-success-border"
            >
              {(relevanceDisplay * 100).toFixed(0)}% match
            </span>
          )}
        </div>
      </div>

      <div className="bg-evidence-bg border border-evidence-border/50 rounded p-2.5 my-2">
        <p className="font-mono text-xs leading-relaxed text-evidence-text italic break-words">
          "{citation.excerpt}"
        </p>
      </div>

      <div className="mt-2.5 flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 text-[11px] text-content-muted font-mono">
          <CheckCircle2 className="w-3 h-3 text-semantic-success-text" />
          <span>Validated source</span>
        </div>

        {onOpenPreview && (
          <button
            type="button"
            onClick={() => onOpenPreview(citation)}
            className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover font-medium transition-colors"
          >
            <span>Preview in document</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
