import React from "react";
import { FolderOpen, Search, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-lg border border-dashed border-border bg-surface-subtle/30 ${className}`}
    >
      <div className="w-12 h-12 rounded-md bg-surface flex items-center justify-center border border-border shadow-xs text-content-muted mb-3">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-sm font-semibold text-content-primary mb-1">{title}</h3>
      <p className="text-xs text-content-secondary max-w-sm mb-4 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

