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
      className={`p-3.5 rounded-[6px] border transition-all ${
        active
          ? "bg-evidence-bg border-citation-text shadow-sm ring-1 ring-citation-text"
          : "bg-evidence-bg/70 border-evidence-border hover:border-border-strong hover:bg-evidence-bg"
      } ${className}`}
    >
      {/* Header bar: Citation token, Document title, Page number */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-evidence-border/60 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-[3px] bg-citation border border-citation-border text-citation-text text-[10px] font-bold tabular-nums shrink-0">
            {citation.citation_index}
          </span>
          <FileText className="w-3.5 h-3.5 text-content-muted shrink-0" />
          <span className="font-semibold text-content-primary truncate text-xs">
            {citation.filename || "Document"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-[4px] bg-surface text-content-secondary border border-border tabular-nums">
            Page {citation.page_number || 1}
          </span>
          {relevanceDisplay && (
            <span
              title="Cosine similarity confidence"
              className="text-[10px] font-medium text-semantic-success-text bg-semantic-success-bg px-1 py-0.5 rounded-[3px] border border-semantic-success-border tabular-nums"
            >
              {(relevanceDisplay * 100).toFixed(0)}% match
            </span>
          )}
        </div>
      </div>

      {/* Quoted passage body in Source Serif 4 */}
      <div className="p-2.5 my-1.5 rounded-[4px] bg-surface border border-evidence-border/40">
        <blockquote className="font-reading text-[13px] leading-relaxed text-content-primary italic break-words">
          "{citation.excerpt}"
        </blockquote>
      </div>

      {/* Footer bar: Verification marker and View in Reader action */}
      <div className="mt-2 flex items-center justify-between pt-1 text-[11px]">
        <div className="flex items-center gap-1 text-content-muted">
          <CheckCircle2 className="w-3 h-3 text-semantic-success-text" />
          <span>Server-verified ground truth</span>
        </div>

        {onOpenPreview && (
          <button
            type="button"
            onClick={() => onOpenPreview(citation.document_id, citation.page_number)}
            className="inline-flex items-center gap-1 text-accent hover:text-accent-hover font-medium cursor-pointer"
          >
            <span>Inspect in Reader</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function SourceCard({
  citation,
  active = false,
  onClick,
  className = "",
}) {
  if (!citation) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-2.5 p-2 rounded-[5px] border text-left transition-colors cursor-pointer ${
        active
          ? "bg-surface border-citation-text ring-1 ring-citation-text"
          : "bg-surface/80 border-border hover:bg-surface hover:border-border-strong"
      } ${className}`}
    >
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-[3px] bg-citation border border-citation-border text-citation-text text-[10px] font-bold tabular-nums shrink-0 mt-0.5">
        {citation.citation_index}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold text-content-primary truncate">
            {citation.filename}
          </span>
          <span className="text-[10px] text-content-muted shrink-0 tabular-nums">
            p. {citation.page_number || 1}
          </span>
        </div>
        <p className="text-[11px] font-reading text-content-secondary line-clamp-1 italic mt-0.5">
          "{citation.excerpt}"
        </p>
      </div>
    </button>
  );
}
