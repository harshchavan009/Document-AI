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
      {/* Document boundary with folded top-right corner */}
      <path
        d="M4 4.5C4 3.67 4.67 3 5.5 3H14L20 9V20.5C20 21.33 19.33 22 18.5 22H5.5C4.67 22 4 21.33 4 20.5V4.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Folded paper crease */}
      <path
        d="M14 3V9H20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Grounded Citation Marker Token in Warm Ember */}
      <path
        d="M8.5 13H7.5V17H8.5"
        stroke="var(--dm-citation-text, #9C381E)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 13H16.5V17H15.5"
        stroke="var(--dm-citation-text, #9C381E)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Verifiable evidence text passage between brackets */}
      <path
        d="M10 15H14"
        stroke="var(--dm-citation-text, #9C381E)"
        strokeWidth="1.75"
        strokeLinecap="round"
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
      <div className="flex items-baseline gap-1">
        <span className="font-bold text-sm tracking-tight text-content-primary">
          DocuMind
        </span>
        <span className="text-[10px] font-semibold tracking-wider uppercase text-accent px-1 py-0.5 rounded bg-accent-subtle/50">
          AI
        </span>
      </div>
    </div>
  );
}

