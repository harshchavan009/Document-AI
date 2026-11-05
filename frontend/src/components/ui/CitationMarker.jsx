import React, { useState } from "react";
import { FileText, ArrowRight } from "lucide-react";

export function CitationMarker({
  index,
  citation,
  onClick,
  active = false,
  className = "",
}) {
  const [showPopover, setShowPopover] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(index);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onClick) onClick(index);
    }
  };

  return (
    <span className="relative inline-block mx-0.5 align-baseline select-none">
      <button
        type="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
        onFocus={() => setShowPopover(true)}
        onBlur={() => setShowPopover(false)}
        className={`inline-flex items-center justify-center tabular-nums text-[10px] font-bold px-1.5 py-0.2 rounded-[3px] transition-all cursor-pointer border ${
          active
            ? "bg-citation-hover text-white border-citation-hover ring-1 ring-citation-hover shadow-xs"
            : "bg-citation border-citation-border text-citation-text hover:bg-citation-hover hover:text-white hover:border-citation-hover"
        } ${className}`}
        aria-label={`View citation [${index}]`}
        data-citation-index={index}
      >
        [{index}]
      </button>

      {/* Popover preview on hover or focus */}
      {showPopover && citation && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 p-3 bg-surface border border-border rounded-[6px] shadow-lg text-left pointer-events-none animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center gap-1.5 text-xs font-medium text-content-primary mb-1.5 border-b border-border pb-1.5">
            <FileText className="w-3.5 h-3.5 text-citation-text shrink-0" />
            <span className="truncate font-semibold">{citation.filename || "Document"}</span>
            <span className="ml-auto text-[11px] text-content-muted shrink-0 tabular-nums">
              Page {citation.page_number || 1}
            </span>
          </div>

          <p className="text-[12px] font-reading leading-relaxed text-content-secondary line-clamp-3 italic">
            "{citation.excerpt}"
          </p>

          <div className="mt-2 pt-1 border-t border-border/40 flex items-center justify-between text-[10px] text-citation-text font-medium">
            <span>Click to view page in reader</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      )}
    </span>
  );
}
