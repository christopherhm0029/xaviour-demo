"use client";

import { useState } from "react";

interface InlineCalendarProps {
  onSlotSelect: (label: string) => void;
  onCollapse: () => void;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const MOCK_TIME_SLOTS = [
  "10:00 AM free",
  "2:30 PM free",
  "4:00 PM free",
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  // Monday = 0 in our grid
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function formatSlotLabel(date: Date, time: string): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const timeOnly = time.replace(" free", "");
  return `confirm ${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} · ${timeOnly}`;
}

export function InlineCalendar({ onSlotSelect, onCollapse }: InlineCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const weeks = getMonthGrid(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const goBack = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goForward = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotClick = (slot: string) => {
    if (!selectedDate) return;
    setSelectedSlot(slot);
    onSlotSelect(formatSlotLabel(selectedDate, slot));
    setTimeout(() => onCollapse(), 400);
  };

  const isPast = (date: Date) => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  return (
    <div className="pt-3 pb-2 max-w-[280px]">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={goBack}
          className="font-[var(--font-heading)] text-[13px] text-[var(--color-text-muted)] cursor-pointer transition-opacity duration-150 hover:opacity-70"
        >
          ←
        </button>
        <span className="font-[var(--font-heading)] text-[12px] text-[var(--color-text-muted)]">
          {monthLabel}
        </span>
        <button
          onClick={goForward}
          className="font-[var(--font-heading)] text-[13px] text-[var(--color-text-muted)] cursor-pointer transition-opacity duration-150 hover:opacity-70"
        >
          →
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((label, i) => (
          <span
            key={i}
            className="font-[var(--font-heading)] text-[10px] text-[var(--color-text-muted)] text-center"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date, i) => {
          if (!date) {
            return <span key={`empty-${i}`} />;
          }

          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const past = isPast(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => !past && handleDayClick(date)}
              disabled={past}
              className={`
                font-[var(--font-heading)] text-[12px] py-1.5 rounded-full
                transition-all duration-150
                ${
                  isSelected
                    ? "bg-[var(--color-accent)] text-white font-medium cursor-pointer"
                    : isToday
                      ? "glass-pill border border-[var(--color-accent)] text-[var(--color-accent-text)] font-medium cursor-pointer"
                      : past
                        ? "text-[var(--color-text-muted)] opacity-30 cursor-default"
                        : "text-[var(--color-text-muted)] cursor-pointer hover:border hover:border-[var(--color-pill-border)] hover:glass-pill"
                }
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Time slots — appear when a future date is selected */}
      {selectedDate && !isPast(selectedDate) && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {MOCK_TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              onClick={() => handleSlotClick(slot)}
              className={`
                font-[var(--font-heading)] text-[12px] py-1 px-3 rounded-full
                transition-all duration-150 cursor-pointer
                ${
                  selectedSlot === slot
                    ? "bg-[var(--color-confirmed-bg)] border border-[var(--color-confirmed-border)] text-[var(--color-confirmed-text)]"
                    : "glass-pill border border-[var(--color-pill-border)] text-[var(--color-pill-text)] hover:brightness-95"
                }
              `}
            >
              {selectedSlot === slot ? `✓ ${slot}` : slot}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
