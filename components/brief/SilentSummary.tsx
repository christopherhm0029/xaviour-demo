"use client";

import { useState } from "react";

interface SilentSummaryProps {
  count: number;
  sample: string[];
}

export function SilentSummary({ count, sample }: SilentSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-4">
      <p className="font-[var(--font-body)] text-[var(--color-text-body)] text-[15px] leading-[2.0]">
        {count} others processed silently —{" "}
        <button
          onClick={() => setExpanded(!expanded)}
          className="font-[var(--font-heading)] text-[var(--color-accent-text)] text-[13px] border-b border-dotted border-[var(--color-accent-text)] cursor-pointer hover:opacity-80 transition-opacity duration-150"
        >
          {expanded ? "hide" : "see what AI handled →"}
        </button>
      </p>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <p className="font-[var(--font-heading)] text-[13px] text-[var(--color-text-muted)] pt-2">
            {sample.join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
}
