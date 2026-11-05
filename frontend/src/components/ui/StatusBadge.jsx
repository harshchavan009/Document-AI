import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";

export function StatusBadge({ status, errorMessage, className = "" }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const normalized = (status || "Uploaded").toLowerCase();

  const configs = {
    ready: {
      label: "Ready",
      bg: "bg-semantic-success-bg border-semantic-success-border text-semantic-success-text",
      icon: CheckCircle2,
      animate: false,
    },
    uploaded: {
      label: "Uploaded",
      bg: "bg-surface-subtle border-border text-content-muted",
      icon: Clock,
      animate: false,
    },
    extracting: {
      label: "Extracting",
      bg: "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300",
      icon: Loader2,
      animate: true,
    },
    chunking: {
      label: "Chunking",
      bg: "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300",
      icon: Loader2,
      animate: true,
    },
    "generating embeddings": {
      label: "Generating Embeddings",
      bg: "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300",
      icon: Loader2,
      animate: true,
    },
    indexing: {
      label: "Indexing",
      bg: "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300",
      icon: Loader2,
      animate: true,
    },
    failed: {
      label: "Failed",
      bg: "bg-semantic-error-bg border-semantic-error-border text-semantic-error-text cursor-help",
      icon: AlertCircle,
      animate: false,
    },
  };

  const current = configs[normalized] || {
    label: status,
    bg: "bg-surface-subtle border-border text-content-muted",
    icon: Clock,
    animate: false,
  };

  const IconComponent = current.icon;

  return (
    <div className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${current.bg} ${className}`}
      >
        <IconComponent
          className={`w-3 h-3 shrink-0 ${current.animate ? "animate-spin" : ""}`}
        />
        <span>{current.label}</span>
      </span>

      {showTooltip && normalized === "failed" && errorMessage && (
        <div className="absolute bottom-full left-0 mb-1 z-30 w-64 p-2 text-xs bg-surface border border-semantic-error-border text-semantic-error-text rounded shadow-lg">
          <p className="font-semibold mb-0.5">Failure Reason:</p>
          <p className="text-[11px] leading-relaxed break-words">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
