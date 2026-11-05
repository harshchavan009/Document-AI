import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[6px] border border-border bg-surface-subtle/40 ${className}`}
    >
      <div className="w-10 h-10 rounded-[5px] bg-surface flex items-center justify-center border border-border shadow-xs text-accent mb-3">
        <Icon className="w-5 h-5" />
      </div>

      <h3 className="text-sm font-semibold text-content-primary mb-1 tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-content-secondary max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {actionLabel && onAction && (
            <Button size="sm" icon={actionIcon} onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button size="sm" variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
