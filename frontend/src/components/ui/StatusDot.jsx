import React, { useState } from "react";
import { AlertCircle } from "lucide-react";

export function StatusDot({ status, errorMessage, showText = true, className = "" }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const normalized = (status || "Uploaded").toLowerCase();

  let dotColor = "bg-content-muted";
  let textColor = "text-content-secondary";
  let label = status || "Uploaded";
  let isPulsing = false;

  if (normalized === "ready") {
    dotColor = "bg-semantic-success-text";
    textColor = "text-content-primary";
    label = "Ready";
  } else if (
    [
      "uploaded",
      "extracting",
      "chunking",
      "generating embeddings",
      "indexing",
      "ingesting",
    ].includes(normalized)
  ) {
    dotColor = "bg-semantic-warning-text";
    textColor = "text-content-secondary";
    isPulsing = true;
    if (normalized === "uploaded") label = "Queued";
    else if (normalized === "extracting") label = "Extracting";
    else if (normalized === "chunking") label = "Chunking";
    else if (normalized === "generating embeddings") label = "Embedding";
    else if (normalized === "indexing") label = "Indexing";
  } else if (normalized === "failed") {
    dotColor = "bg-semantic-error-text";
    textColor = "text-semantic-error-text font-medium";
    label = "Failed";
  }

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 text-xs select-none ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {isPulsing && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>

      {showText && <span className={`${textColor} truncate`}>{label}</span>}

      {normalized === "failed" && errorMessage && (
        <AlertCircle className="w-3 h-3 text-semantic-error-text shrink-0" />
      )}

      {/* Real error tooltip */}
      {showTooltip && normalized === "failed" && errorMessage && (
        <div className="absolute left-0 bottom-full mb-1.5 z-50 w-64 p-2 bg-surface text-content-primary text-[11px] rounded border border-semantic-error-border shadow-md pointer-events-none">
          <p className="font-semibold text-semantic-error-text mb-0.5">Failure Reason:</p>
          <p className="text-content-secondary leading-normal">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

// Backward-compatible alias for existing imports
export const StatusBadge = StatusDot;

