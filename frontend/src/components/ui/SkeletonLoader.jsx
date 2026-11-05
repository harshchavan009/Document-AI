import React from "react";

export function SkeletonLoader({ type = "row", count = 3, className = "" }) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === "row") {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3.5 bg-surface border border-border rounded-md animate-pulse"
          >
            <div className="w-5 h-5 bg-border rounded-xs shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="w-1/3 h-3.5 bg-border rounded" />
              <div className="w-1/5 h-2.5 bg-border-subtle rounded" />
            </div>
            <div className="w-16 h-5 bg-border rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((i) => (
          <div
            key={i}
            className="p-4 bg-surface border border-border rounded-md animate-pulse space-y-2.5"
          >
            <div className="flex justify-between items-center">
              <div className="w-1/3 h-4 bg-border rounded" />
              <div className="w-12 h-4 bg-border-subtle rounded" />
            </div>
            <div className="w-full h-12 bg-border-subtle rounded" />
            <div className="w-1/4 h-3 bg-border-subtle rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      <div className="w-3/4 h-4 bg-border rounded" />
      <div className="w-full h-3 bg-border-subtle rounded" />
      <div className="w-2/3 h-3 bg-border-subtle rounded" />
    </div>
  );
}

