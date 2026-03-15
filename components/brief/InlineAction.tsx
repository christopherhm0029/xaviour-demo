"use client";

import { useState, useEffect } from "react";
import type { ActionType } from "@/lib/mock-data";

interface InlineActionProps {
  label: string;
  type: ActionType;
  onAction: () => void;
  externalConfirmed?: boolean;
}

export function InlineAction({ label, type, onAction, externalConfirmed }: InlineActionProps) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (externalConfirmed) setConfirmed(true);
  }, [externalConfirmed]);

  const handleClick = () => {
    if (confirmed) return;
    setConfirmed(true);
    onAction();
  };

  if (confirmed) {
    return (
      <button
        className="inline-flex items-center gap-1 bg-[var(--color-confirmed-bg)] border border-[var(--color-confirmed-border)] text-[var(--color-confirmed-text)] text-[13px] font-[var(--font-heading)] font-medium py-1 px-3 rounded-full transition-all duration-150 cursor-default"
        disabled
      >
        ✓ {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 glass-pill border border-[var(--color-pill-border)] text-[var(--color-pill-text)] text-[13px] font-[var(--font-heading)] font-medium py-1 px-3 rounded-full transition-all duration-150 cursor-pointer hover:brightness-95"
    >
      {label}
    </button>
  );
}
