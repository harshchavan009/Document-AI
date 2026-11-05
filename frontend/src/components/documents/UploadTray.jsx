import React from "react";
import { UploadCloud, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp } from "lucide-react";

export function UploadTray({
  uploads = [],
  onDismiss,
  minimized = false,
  onToggleMinimize,
}) {
  if (!uploads || uploads.length === 0) return null;

  const inProgressCount = uploads.filter(
    (u) => !u.completed && !u.failed
  ).length;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-surface border border-border rounded-[8px] shadow-floating overflow-hidden animate-in slide-in-from-bottom-2 duration-150">
      {/* Tray Header */}
      <div className="p-3 border-b border-border bg-surface-subtle/60 flex items-center justify-between text-xs font-semibold text-content-primary">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-accent shrink-0" />
          <span>
            {inProgressCount > 0
              ? `Processing ${inProgressCount} file${inProgressCount === 1 ? "" : "s"}`
              : "Uploads Completed"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onToggleMinimize && (
            <button
              type="button"
              onClick={onToggleMinimize}
              className="p-1 rounded text-content-muted hover:text-content-primary"
              title={minimized ? "Expand" : "Minimize"}
            >
              {minimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded text-content-muted hover:text-content-primary"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tray List */}
      {!minimized && (
        <div className="max-h-60 overflow-y-auto p-2 space-y-1.5 divide-y divide-border/40">
          {uploads.map((file, idx) => (
            <div key={file.id || idx} className="pt-1.5 first:pt-0 space-y-1 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-content-primary truncate text-xs">
                  {file.name}
                </span>
                <span className="text-[10px] font-mono text-content-muted shrink-0">
                  {file.failed
                    ? "Failed"
                    : file.completed
                    ? "Ready"
                    : file.stage || `${file.percentage || 0}%`}
                </span>
              </div>

              {/* Progress Bar */}
              {!file.completed && !file.failed && (
                <div className="w-full h-1 bg-surface-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-200"
                    style={{ width: `${Math.max(5, file.percentage || 0)}%` }}
                  />
                </div>
              )}

              {file.error && (
                <p className="text-[10px] text-semantic-error-text leading-tight">
                  {file.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

