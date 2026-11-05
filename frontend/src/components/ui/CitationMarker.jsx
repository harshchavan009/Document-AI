import React, { useState } from "react";
import { FileText } from "lucide-react";

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
    <span className="relative inline-block mx-0.5 align-baseline">
      <button
        type="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
        onFocus={() => setShowPopover(true)}
        onBlur={() => setShowPopover(false)}
        className={`inline-flex items-center justify-center font-mono text-[11px] font-semibold px-1 py-0.5 rounded-xs transition-all cursor-pointer ${
          active
            ? "bg-accent text-white ring-2 ring-accent"
            : "bg-accent-subtle text-accent-text hover:bg-accent hover:text-white border border-accent/20"
        } ${className}`}
        aria-label={`View citation ${index}`}
      >
        [{index}]
      </button>

      {showPopover && citation && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 w-72 p-3 bg-surface border border-border rounded-md shadow-lg text-left pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-content-primary mb-1 border-b border-border/60 pb-1.5">
            <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="truncate">{citation.filename || "Source Document"}</span>
            <span className="ml-auto text-[10px] text-content-muted shrink-0">
              Page {citation.page_number || 1}
            </span>
          </div>
          <p className="font-mono text-[11px] leading-relaxed text-content-secondary line-clamp-3 italic">
            "{citation.excerpt}"
          </p>
          <div className="mt-2 text-[10px] text-accent font-medium">
            Click to inspect evidence in sidebar
          </div>
        </div>
      )}
    </span>
  );
}
