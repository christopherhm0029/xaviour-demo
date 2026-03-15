"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import type { Category, CalendarEvent } from "@/lib/mock-data";
import { XaviourMark } from "./XaviourIcon";

interface NavBarProps {
  counts: { urgent: number; important: number; informative: number; noise: number };
  userName: string;
  userEmail?: string;
  onCategoryClick?: (category: Category | "noise") => void;
  onOverviewClick?: () => void;
  nextEvent?: CalendarEvent;
  activeCategory?: Category | "noise" | null;
  syncing?: boolean;
  onSync?: () => void;
}

const pillItems: {
  key: Category | "noise";
  label: string;
  color: string;
}[] = [
  { key: "urgent", label: "urgent", color: "#dc2626" },
  { key: "important", label: "important", color: "#b45309" },
  { key: "informative", label: "to read", color: "#1d4ed8" },
  { key: "noise", label: "handled", color: "var(--color-text-muted)" },
];

function getDefaultPill(counts: NavBarProps["counts"]): { key: string; color: string } {
  if (counts.urgent > 0) return { key: "urgent", color: "#dc2626" };
  if (counts.important > 0) return { key: "important", color: "#b45309" };
  return { key: "informative", color: "#1d4ed8" };
}

function getShortTitle(title: string): string {
  const words = title.split(" ");
  if (words.length <= 2) return title.toLowerCase();
  return words[words.length - 1].toLowerCase();
}

export function NavBar({ counts, userName, userEmail, onCategoryClick, onOverviewClick, nextEvent, activeCategory, syncing, onSync }: NavBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close on outside click
  useEffect(() => {
    if (!expanded && !avatarOpen) return;
    function handleClick(e: MouseEvent) {
      if (expanded && navRef.current && !navRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
      if (avatarOpen && avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [expanded, avatarOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      window.location.reload();
    } catch {
      setSigningOut(false);
    }
  }

  const countMap: Record<string, number> = {
    urgent: counts.urgent,
    important: counts.important,
    informative: counts.informative,
    noise: counts.noise,
  };

  // Which pill to show when collapsed
  const defaultPill = getDefaultPill(counts);
  const visiblePillKey = activeCategory || defaultPill.key;
  const visiblePill = pillItems.find((p) => p.key === visiblePillKey) ?? pillItems[0];

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 glass-nav border-b border-[var(--color-border)] h-[52px] px-3 sm:px-6 flex items-center justify-between"
    >
      {/* Left — Logo */}
      <span className="font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.16em] uppercase text-[var(--color-text-primary)] flex items-center gap-[6px]">
        <XaviourMark size={18} animate="idle" /> Xaviour
      </span>

      {/* Center — Inline expanding category pills */}
      <div className="flex items-center gap-1">
        {/* Overview pill — always visible, active when no filter */}
        <button
          onClick={() => {
            if (expanded) {
              onOverviewClick?.();
              setExpanded(false);
            } else {
              setExpanded(true);
            }
          }}
          className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full font-[var(--font-heading)] text-[12px] font-medium cursor-pointer hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)]"
          style={{
            border: activeCategory === null
              ? "1px solid rgba(46,107,230,0.3)"
              : "1px solid transparent",
            background: activeCategory === null
              ? "rgba(46,107,230,0.07)"
              : undefined,
            opacity: expanded || !activeCategory ? 1 : 0,
            transform: expanded || !activeCategory ? "scale(1)" : "scale(0.92)",
            width: expanded || !activeCategory ? undefined : 0,
            padding: expanded || !activeCategory ? undefined : 0,
            overflow: "hidden",
            transition: "opacity 200ms, transform 200ms, width 300ms cubic-bezier(0.4, 0, 0.2, 1), padding 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <span
            className="block w-[6px] h-[6px] rounded-full shrink-0"
            style={{ backgroundColor: "#2E6BE6" }}
          />
          <span className="font-semibold whitespace-nowrap" style={{ color: "#2E6BE6" }}>
            {counts.urgent + counts.important + counts.informative}
          </span>
          <span
            className="whitespace-nowrap"
            style={{ color: activeCategory === null ? "#2E6BE6" : "var(--color-text-muted)" }}
          >
            overview
          </span>
        </button>

        {pillItems.map((item, index) => {
          const isSelected = activeCategory === item.key;
          const isVisible = activeCategory ? item.key === visiblePill.key : false;
          const show = expanded || isVisible;

          return (
            <button
              key={item.key}
              onClick={() => {
                if (!expanded) {
                  setExpanded(true);
                } else {
                  onCategoryClick?.(item.key as Category | "noise");
                  setExpanded(false);
                }
              }}
              className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full font-[var(--font-heading)] text-[12px] font-medium cursor-pointer hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)]"
              style={{
                border: isSelected
                  ? `1px solid color-mix(in srgb, ${item.color} 35%, transparent)`
                  : "1px solid transparent",
                background: isSelected
                  ? `color-mix(in srgb, ${item.color} 7%, transparent)`
                  : undefined,
                opacity: show ? 1 : 0,
                transform: show ? "scale(1)" : "scale(0.92)",
                width: show ? undefined : 0,
                padding: show ? undefined : 0,
                overflow: "hidden",
                transition: `opacity 200ms ${index * 40}ms, transform 200ms ${index * 40}ms, width 300ms cubic-bezier(0.4, 0, 0.2, 1), padding 300ms cubic-bezier(0.4, 0, 0.2, 1)`,
              }}
            >
              <span
                className="block w-[6px] h-[6px] rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-semibold whitespace-nowrap" style={{ color: item.color }}>
                {countMap[item.key]}
              </span>
              <span
                className="whitespace-nowrap"
                style={{ color: isSelected ? item.color : "var(--color-text-muted)" }}
              >
                {item.label}
              </span>
              {/* Arrow on the visible/selected pill */}
              {isVisible && (
                <span
                  className="inline-block transition-transform duration-[250ms] ease-in-out text-[10px]"
                  style={{
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    color: item.color,
                  }}
                >
                  ↓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right — Live + Meeting + Theme + Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5">
          {syncing ? (
            <>
              <span className="relative flex h-[7px] w-[7px]">
                <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-[#3b82f6] xav-sync-dot" />
              </span>
              <span className="font-[var(--font-heading)] text-[12px] font-semibold text-[#3b82f6] tracking-wide uppercase">
                Syncing
              </span>
            </>
          ) : (
            <>
              <span className="relative flex h-[7px] w-[7px]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
                <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-[#22c55e]" />
              </span>
              <span className="font-[var(--font-heading)] text-[12px] font-semibold text-[#22c55e] tracking-wide uppercase">
                Live
              </span>
            </>
          )}
          <button
            onClick={() => !syncing && onSync?.()}
            disabled={syncing}
            className="ml-0.5 cursor-pointer disabled:cursor-default"
            title="Sync now"
            style={{ color: "rgba(0,0,0,0.3)", fontSize: "14px", background: "none", border: "none", lineHeight: 1 }}
          >
            <span
              className="inline-block font-[var(--font-heading)]"
              style={{ animation: syncing ? "xav-spin 1s linear infinite" : "none" }}
            >
              ↻
            </span>
          </button>
        </div>

        {nextEvent && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-px h-[14px] bg-[var(--color-border-strong)]" />
            <span className="font-[var(--font-heading)] text-[12px] text-[var(--color-text-muted)]">
              {nextEvent.startTime} · {getShortTitle(nextEvent.title)}
            </span>
          </div>
        )}

        {mounted && (
          <button
            onClick={() => setTheme(theme === "linen" ? "arctic" : "linen")}
            className="hidden sm:inline-flex glass-pill border border-[var(--color-border)] rounded-full px-2.5 py-1 text-[10px] font-medium text-[var(--color-text-muted)] cursor-pointer transition-all duration-150 hover:brightness-95"
          >
            {theme === "linen" ? "linen" : "arctic"}
          </button>
        )}

        <div ref={avatarRef} className="relative">
          <button
            onClick={() => setAvatarOpen((v) => !v)}
            className="w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-[11px] font-semibold cursor-pointer border-none"
          >
            {userName.charAt(0)}
          </button>
          {avatarOpen && (
            <div
              className="absolute right-0 top-[calc(100%+6px)] font-[var(--font-heading)]"
              style={{
                background: "var(--color-surface, #fff)",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                minWidth: "200px",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">
                  {userName}
                </p>
                {userEmail && (
                  <p className="text-[11px] text-[var(--color-text-muted)] truncate mt-0.5">
                    {userEmail}
                  </p>
                )}
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full text-left px-4 py-2.5 text-[12px] font-medium cursor-pointer border-none transition-colors duration-100"
                style={{
                  background: "transparent",
                  color: signingOut ? "var(--color-text-muted)" : "#dc2626",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {signingOut ? "Signing out…" : "Sign out & switch account"}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
