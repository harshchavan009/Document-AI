import React from "react";

export function BrandMark({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Underlying Indexed Corpus Layer (Offset Document Plane) */}
      <rect
        x="6.5"
        y="2.5"
        width="13"
        height="15"
        rx="2"
        className="stroke-current opacity-40"
        strokeWidth="1.6"
      />
      {/* Active Foreground Document Plane */}
      <rect
        x="3.5"
        y="5.5"
        width="13"
        height="15"
        rx="2"
        className="stroke-current"
        strokeWidth="1.6"
        fill="var(--dm-bg-surface, #FFFFFF)"
      />
      {/* Precision Grounded Citation Marker Token in Warm Ember */}
      <path
        d="M7 11.5H6V14.5H7"
        stroke="var(--dm-citation-text, #9C381E)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 11.5H14V14.5H13"
        stroke="var(--dm-citation-text, #9C381E)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Verified Passage Lens / Focal Dot */}
      <circle
        cx="10"
        cy="13"
        r="1.25"
        fill="var(--dm-citation-text, #9C381E)"
      />
      {/* Upper Subtle Document Header Line */}
      <line
        x1="7"
        y1="9"
        x2="13"
        y2="9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="opacity-35"
      />
    </svg>
  );
}

export function BrandWordmark({ size = 20, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 font-sans ${className}`}>
      <div className="text-accent flex items-center justify-center">
        <BrandMark size={size} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-semibold text-sm tracking-tight text-content-primary">
          DocuMind
        </span>
        <span className="text-[10px] font-semibold tracking-wider uppercase text-accent px-1 py-0.2 rounded-[3px] bg-accent-subtle border border-accent/20">
          AI
        </span>
      </div>
    </div>
  );
}
