"use client";

import { useState, useRef } from "react";
import type { EmailBriefItem } from "@/lib/mock-data";
import { InlineAction } from "./InlineAction";
import { InlineCalendar } from "./InlineCalendar";

interface BriefParagraphProps {
  item: EmailBriefItem;
  onEditOpen: (item: EmailBriefItem) => void;
  onReply?: (item: EmailBriefItem) => void;
  onAction?: (itemId: string) => void;
}

// ─── Category Dots ──────────────────────────────────────────────

const CATEGORY_DOT: Record<string, { color: string }> = {
  urgent: { color: "#dc2626" },
  important: { color: "#d97706" },
  informative: { color: "var(--color-text-muted)" },
  noise: { color: "var(--color-text-muted)" },
  travel: { color: "var(--color-text-muted)" },
};

function CategoryIndicator({ category }: { category: string }) {
  if (category === "travel") {
    return <span className="text-[12px] leading-none shrink-0">✈️</span>;
  }
  const dot = CATEGORY_DOT[category] || CATEGORY_DOT.informative;
  return (
    <span
      className="block w-[7px] h-[7px] rounded-full shrink-0"
      style={{ backgroundColor: dot.color }}
    />
  );
}

// ─── Prose Truncation ───────────────────────────────────────────

function truncateProse(prose: string): { text: string; truncated: boolean } {
  const sentences = prose.match(/[^.!?]+[.!?]+(?:\s|$)/g);
  if (!sentences || sentences.length <= 2) return { text: prose, truncated: false };
  return { text: sentences.slice(0, 2).join("").trim() + " …", truncated: true };
}

// ─── Component ──────────────────────────────────────────────────

export function BriefParagraph({ item, onEditOpen, onReply, onAction }: BriefParagraphProps) {
  const [expanded, setExpanded] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [confirmLabel, setConfirmLabel] = useState<string | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotation({
      x: (y - centerY) / 30,
      y: -(x - centerX) / 30,
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const hasConfirmAction = item.actions.some((a) => a.type === "confirm");
  const { text: truncatedText, truncated: hasMore } = truncateProse(item.narrative);

  const getActionLabel = (action: typeof item.actions[number]) => {
    if (action.type === "confirm" && confirmLabel) return confirmLabel;
    return action.label;
  };

  return (
    <div
      ref={cardRef}
      className="brief-entry relative group"
      data-expanded={expanded}
      style={{
        perspective: "1000px",
        padding: "16px 20px",
        borderRadius: "12px",
        position: "relative",
        zIndex: 0,
        background: "transparent",
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: "background 0.25s ease, transform 0.15s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        handleMouseLeave();
        setHovered(false);
      }}
    >
      {/* Ambient glow — layered radial bloom behind entry */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-8px",
          borderRadius: "20px",
          background:
            item.category === "urgent"
              ? "linear-gradient(135deg, rgba(220,38,38,0.22), rgba(220,38,38,0.06))"
              : item.category === "important"
                ? "linear-gradient(135deg, rgba(234,88,12,0.22), rgba(234,88,12,0.06))"
                : item.category === "informative"
                  ? "linear-gradient(135deg, rgba(46,107,230,0.22), rgba(46,107,230,0.06))"
                  : "linear-gradient(135deg, rgba(71,85,105,0.18), rgba(71,85,105,0.05))",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
          filter: "blur(16px)",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1, backgroundColor: "transparent" }}>
        {/* Header — dot · sender · subject · chevron */}
        <div
          className="flex items-center gap-2 mb-1 cursor-pointer select-none"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <CategoryIndicator category={item.category} />
          <span className="font-[var(--font-heading)] font-bold text-[15px] text-[var(--color-text-primary)] shrink-0">
            {item.sender.name}
          </span>
          <span className="text-[var(--color-text-muted)] text-[13px] font-[var(--font-heading)]">·</span>
          <span className="font-[var(--font-heading)] text-[13px] text-[var(--color-text-muted)] truncate flex-1">
            {item.rewrittenSubject || item.subject}
          </span>
          {hasMore && (
            <span
              className="text-[var(--color-text-muted)] text-[12px] font-[var(--font-heading)] shrink-0 transition-transform duration-200 ml-1"
              style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}
            >
              ↓
            </span>
          )}
        </div>

        {/* Prose — truncated or full, click opens modal */}
        <p
          className="font-[var(--font-body)] font-normal text-[var(--color-text-body)] text-[17px] leading-[1.7] pl-[15px] cursor-pointer"
          onClick={() => onEditOpen(item)}
        >
          {expanded ? item.narrative : truncatedText}
        </p>

        {/* Reply / View thread pills — appear on hover */}
        {(item.category === "urgent" || item.category === "important" || (item.messageCount ?? 1) > 1) && (
          <div className="flex gap-2 mt-[12px] pl-[15px] overflow-hidden transition-all duration-200 ease-out" style={{ opacity: hovered || expanded ? 1 : 0, maxHeight: hovered || expanded ? "40px" : "0px" }}>
            {(item.category === "urgent" || item.category === "important") && (
              <button
                onClick={(e) => { e.stopPropagation(); onReply ? onReply(item) : onEditOpen(item); }}
                className="font-[var(--font-heading)] text-[12px] font-medium bg-[#2E6BE6] text-white rounded-full px-[16px] py-[6px] border-none cursor-pointer transition-transform duration-150 hover:scale-[1.02]"
              >
                Reply
              </button>
            )}
            {((item.messageCount ?? 1) > 1 || item.category === "urgent" || item.category === "important") && (
              <button
                onClick={(e) => { e.stopPropagation(); onEditOpen(item); }}
                className="font-[var(--font-heading)] text-[12px] bg-transparent text-[rgba(10,22,40,0.62)] rounded-full px-[16px] py-[6px] border border-[rgba(10,22,40,0.14)] cursor-pointer transition-all duration-150 hover:border-[rgba(10,22,40,0.28)]"
              >
                View thread
              </button>
            )}
          </div>
        )}

        {/* Action pills — hidden at rest, revealed on hover/expanded */}
        <div className="flex items-center mt-2 pl-[15px] transition-opacity duration-200" style={{ opacity: hovered || expanded ? 1 : 0 }}>
          <span className="inline-flex gap-1.5 flex-wrap">
            {item.actions
              .filter((action) => action.type !== "open")
              .map((action) => (
              <InlineAction
                key={action.id}
                label={getActionLabel(action)}
                type={action.type}
                onAction={() => {
                  onAction?.(item.id);
                }}
              />
            ))}
            {hasConfirmAction && expanded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCalendarOpen(!calendarOpen);
                }}
                className="inline-flex items-center gap-1 glass-pill border border-[var(--color-pill-border)] text-[var(--color-pill-text)] text-[13px] font-[var(--font-heading)] font-medium py-1 px-3 rounded-full transition-all duration-150 cursor-pointer hover:brightness-95"
              >
                pick a time {calendarOpen ? "↑" : "↓"}
              </button>
            )}
          </span>
        </div>

        {/* Expand area — calendar picker only */}
        {expanded && hasConfirmAction && (
          <div
            className="grid transition-[grid-template-rows] duration-300 ease-in-out"
            style={{ gridTemplateRows: calendarOpen ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="pt-2 pl-[15px]">
                <InlineCalendar
                  onSlotSelect={(label) => setConfirmLabel(label)}
                  onCollapse={() => setCalendarOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
