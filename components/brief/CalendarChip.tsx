import type { CalendarEvent } from "@/lib/mock-data";

interface CalendarChipProps {
  event: CalendarEvent;
  className?: string;
}

export function CalendarChip({ event, className = "" }: CalendarChipProps) {
  return (
    <div
      className={`glass-chip border border-[var(--color-border-strong)] rounded-[var(--radius-md)] inline-flex items-center gap-2.5 px-4 py-2.5 ${className}`}
    >
      <span className="block w-[7px] h-[7px] rounded-full bg-[var(--color-accent)]" />
      <span className="font-[var(--font-heading)] font-semibold text-[15px] text-[var(--color-text-primary)]">
        {event.startTime}
      </span>
      <span className="font-[var(--font-heading)] text-[13px] text-[var(--color-text-muted)]">
        {event.title} · {event.attendeeCount} attendees
      </span>
      <span className="font-[var(--font-heading)] text-[11px] text-[var(--color-accent-text)] bg-[var(--color-pill-bg)] rounded px-2 py-0.5">
        in {event.minutesUntil} min
      </span>
    </div>
  );
}
