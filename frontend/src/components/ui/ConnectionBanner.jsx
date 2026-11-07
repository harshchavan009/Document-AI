import React, { useState } from "react";
import { AlertCircle, RefreshCw, X, Loader2 } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";

export function ConnectionBanner() {
  const { isServerWarming, error, retryConnection } = useWorkspace();
  const [dismissed, setDismissed] = useState(false);
  const [retrying, setRetrying] = useState(false);

  if (dismissed || (!isServerWarming && !error)) {
    return null;
  }

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await retryConnection();
    } finally {
      setRetrying(false);
    }
  };

  if (isServerWarming) {
    return (
      <aside
        aria-label="Server status notification"
        className="w-full bg-surface-subtle border-b border-border py-2 px-4 transition-all"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs text-content-secondary">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 text-accent animate-spin shrink-0" />
            <span>
              Connecting to research server. Initial cold start may take a few seconds on container wake-up.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 text-content-muted hover:text-content-primary transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside
        aria-label="Connection error notification"
        className="w-full bg-semantic-error-surface border-b border-semantic-error-border py-2 px-4 transition-all"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs text-semantic-error-text">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Unable to reach backend service ({error}). Verify your server is running.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-surface text-content-primary border border-border hover:bg-surface-subtle font-medium text-[11px] transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${retrying ? "animate-spin" : ""}`} />
              Retry
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 text-content-muted hover:text-content-primary transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return null;
}

