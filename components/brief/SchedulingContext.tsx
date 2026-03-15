"use client";

import { useState, useCallback } from "react";
import { XaviourMark } from "./XaviourIcon";

// ─── Types ──────────────────────────────────────────────────────

export interface TimeSlot {
  id: string;
  day: string;        // "Tuesday", "Wednesday"
  date: string;       // "18 Mar"
  start: string;      // "10:00 AM"
  end: string;        // "11:00 AM"
  suggested?: boolean; // AI-recommended slot
}

interface SchedulingContextProps {
  /** Only renders when true */
  isSchedulingEmail?: boolean;
  /** Title — e.g. "Your Tuesday" or "Available times" */
  title?: string;
  /** Available time slots */
  availableSlots?: TimeSlot[];
  /** Called when user picks a slot — returns a reply-ready sentence */
  onSlotSelect?: (slot: TimeSlot, replySentence: string) => void;
  /** Called when user wants to see full calendar */
  onViewCalendar?: () => void;
  /** Sender name for reply generation */
  senderName?: string;
}

// ─── Helpers ────────────────────────────────────────────────────

function buildReplySentence(slot: TimeSlot, senderName?: string): string {
  const firstName = senderName?.split(" ")[0] || "there";
  return `Happy to sync ${slot.day}. I'm free ${slot.start}–${slot.end} — does that work for you, ${firstName}?`;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// ─── Default slots (mock) ───────────────────────────────────────

const DEFAULT_SLOTS: TimeSlot[] = [
  { id: "s1", day: "Tuesday", date: "18 Mar", start: "10:00 AM", end: "11:00 AM", suggested: true },
  { id: "s2", day: "Tuesday", date: "18 Mar", start: "2:00 PM", end: "3:00 PM", suggested: true },
  { id: "s3", day: "Wednesday", date: "19 Mar", start: "11:00 AM", end: "12:00 PM" },
];

// ─── Component ──────────────────────────────────────────────────

export function SchedulingContext({
  isSchedulingEmail = false,
  title = "Available times",
  availableSlots = DEFAULT_SLOTS,
  onSlotSelect,
  onViewCalendar,
  senderName,
}: SchedulingContextProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Calendar state
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const handleSlotClick = useCallback(
    (slot: TimeSlot) => {
      setSelectedId(slot.id);
      const sentence = buildReplySentence(slot, senderName);
      onSlotSelect?.(slot, sentence);
    },
    [senderName, onSlotSelect]
  );

  const toggleCalendar = useCallback(() => {
    setCalendarOpen((prev) => !prev);
    if (!calendarOpen) onViewCalendar?.();
  }, [calendarOpen, onViewCalendar]);

  // Don't render if not a scheduling email
  if (!isSchedulingEmail) return null;

  const weeks = getMonthGrid(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const isPast = (date: Date) => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const goBack = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const goForward = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div style={{ marginTop: "24px" }}>
      {/* Soft divider — same weight as focus panel dividers */}
      <div style={{ height: "1px", background: "rgba(10,22,40,0.06)", marginBottom: "20px" }} />

      {/* Context label — mirrors the "Insight" label pattern in StoriesViewer */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <XaviourMark size={16} />
        <span
          className="font-[var(--font-heading)]"
          style={{ fontSize: "10px", fontWeight: 500, color: "rgba(10,22,40,0.32)", letterSpacing: "0.04em", textTransform: "uppercase" as const }}
        >
          Scheduling detected
        </span>
      </div>

      {/* Title — same weight as card subject headings */}
      <h4
        className="font-[var(--font-heading)]"
        style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "4px" }}
      >
        {title}
      </h4>

      {/* Sublabel */}
      <p
        className="font-[var(--font-body)] italic"
        style={{ fontSize: "13px", color: "rgba(10,22,40,0.45)", marginBottom: "16px", lineHeight: 1.5 }}
      >
        AI found open slots based on your calendar
      </p>

      {/* ── Suggested slots ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
        {availableSlots.map((slot) => {
          const isSelected = selectedId === slot.id;

          return (
            <button
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              className="font-[var(--font-heading)]"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                textAlign: "left" as const,
                padding: "10px 14px",
                borderRadius: "14px",
                border: isSelected
                  ? "1px solid rgba(46,107,230,0.3)"
                  : "1px solid rgba(10,22,40,0.06)",
                background: isSelected
                  ? "rgba(46,107,230,0.06)"
                  : "rgba(10,22,40,0.02)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {/* Status dot */}
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: isSelected ? "#2E6BE6" : "rgba(34,197,94,0.6)",
                  flexShrink: 0,
                }}
              />

              {/* Time info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", display: "block", lineHeight: 1.3 }}>
                  {slot.day} · {slot.start}–{slot.end}
                </span>
                {slot.suggested && !isSelected && (
                  <span style={{ fontSize: "11px", color: "rgba(46,107,230,0.65)", fontWeight: 500 }}>
                    Suggested
                  </span>
                )}
                {isSelected && (
                  <span style={{ fontSize: "11px", color: "#2E6BE6", fontWeight: 500 }}>
                    ✓ Selected — reply updated
                  </span>
                )}
              </div>

              {/* Date badge */}
              <span style={{ fontSize: "11px", color: "rgba(10,22,40,0.3)", flexShrink: 0 }}>
                {slot.date}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Calendar toggle — same ghost style as existing pills ── */}
      <button
        onClick={toggleCalendar}
        className="font-[var(--font-heading)]"
        style={{
          fontSize: "12px",
          color: "rgba(10,22,40,0.4)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          transition: "color 0.15s ease",
        }}
      >
        <span style={{ fontSize: "13px", transition: "transform 0.2s ease", display: "inline-block", transform: calendarOpen ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
        {calendarOpen ? "Hide calendar" : "View calendar"}
      </button>

      {/* ── Expandable mini calendar — grid-template-rows transition ── */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: calendarOpen ? "1fr" : "0fr" }}
      >
        <div style={{ overflow: "hidden" }}>
          <div style={{ paddingTop: "16px", maxWidth: "260px" }}>
            {/* Month nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <button
                onClick={goBack}
                className="font-[var(--font-heading)]"
                style={{ fontSize: "13px", color: "var(--color-text-muted)", cursor: "pointer", background: "none", border: "none", transition: "opacity 0.15s", padding: 0 }}
              >
                ←
              </button>
              <span className="font-[var(--font-heading)]" style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                {monthLabel}
              </span>
              <button
                onClick={goForward}
                className="font-[var(--font-heading)]"
                style={{ fontSize: "13px", color: "var(--color-text-muted)", cursor: "pointer", background: "none", border: "none", transition: "opacity 0.15s", padding: 0 }}
              >
                →
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
              {DAY_LABELS.map((label, i) => (
                <span
                  key={i}
                  className="font-[var(--font-heading)]"
                  style={{ fontSize: "10px", color: "var(--color-text-muted)", textAlign: "center" as const }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Month grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
              {weeks.flat().map((date, i) => {
                if (!date) return <span key={`e-${i}`} />;
                const isToday = isSameDay(date, today);
                const past = isPast(date);

                return (
                  <button
                    key={date.toISOString()}
                    disabled={past}
                    className="font-[var(--font-heading)]"
                    style={{
                      fontSize: "12px",
                      padding: "5px 0",
                      borderRadius: "999px",
                      border: isToday ? "1px solid var(--color-accent)" : "1px solid transparent",
                      background: isToday ? "transparent" : "transparent",
                      color: past ? "rgba(10,22,40,0.2)" : "var(--color-text-muted)",
                      fontWeight: isToday ? 600 : 400,
                      cursor: past ? "default" : "pointer",
                      transition: "all 0.15s ease",
                      textAlign: "center" as const,
                    }}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
