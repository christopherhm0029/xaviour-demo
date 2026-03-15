interface BottomBarProps {
  lastSync?: string | null;
}

export function BottomBar({ lastSync }: BottomBarProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-10 glass-nav border-t border-[var(--color-border)] z-40 px-4 sm:px-6 flex items-center">
      <span className="font-[var(--font-heading)] text-[12px] text-[var(--color-text-muted)]">
        Last sync: {lastSync || "just now"}
      </span>
    </footer>
  );
}
