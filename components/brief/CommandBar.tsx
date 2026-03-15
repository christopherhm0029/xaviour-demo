"use client";

import { useState, useRef, useEffect } from "react";
import { Mic } from "lucide-react";
import XaviourIcon from "./XaviourIcon";
import { mainPageSuggestions } from "@/lib/mock-data";

interface EmailContext {
  threadId?: string;
  sender: { name: string; email: string };
  subject: string;
  narrative: string;
  category: string;
}

interface CommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResponse: (text: string) => void;
  emailContext?: EmailContext[];
  userName?: string;
}

export function CommandBar({ open, onOpenChange, onResponse, emailContext, userName }: CommandBarProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when expanded
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    // Show suggestions after a brief delay when opened with empty input
    if (open) {
      const timer = setTimeout(() => setShowSuggestions(true), 150);
      return () => clearTimeout(timer);
    } else {
      setShowSuggestions(false);
    }
  }, [open]);

  // Hide suggestions when user types
  useEffect(() => {
    if (value.trim()) setShowSuggestions(false);
  }, [value]);

  const submitQuery = async (query: string) => {
    if (!query.trim()) return;
    if (loading) return;

    setLoading(true);
    setShowSuggestions(false);
    setValue("");

    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          context: {
            emails: emailContext?.map((e) => ({
              threadId: e.threadId || "",
              sender: e.sender.name,
              senderEmail: e.sender.email,
              subject: e.subject,
              narrative: e.narrative,
              category: e.category,
            })),
            userName,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onResponse(data.response || "I couldn't find an answer to that.");
      } else {
        onResponse("Something went wrong — try again.");
      }
    } catch {
      onResponse("Couldn't reach Xaviour — check your connection.");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  const handleSubmit = () => submitQuery(value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
      setValue("");
    }
  };

  return (
    <>
      {/* Suggestion chips — float above bar when open */}
      {open && showSuggestions && !value.trim() && !loading && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-44 flex items-center gap-2 flex-wrap justify-center"
          style={{
            bottom: 118,
            maxWidth: 560,
            opacity: showSuggestions ? 1 : 0,
            transition: "opacity 350ms ease",
          }}
        >
          {mainPageSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => submitQuery(suggestion)}
              className="font-[var(--font-heading)] text-[12px] cursor-pointer"
              style={{
                color: "var(--color-text-muted)",
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid var(--color-border)",
                borderRadius: "999px",
                padding: "6px 14px",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.background = "rgba(255,255,255,0.85)";
                (e.target as HTMLElement).style.borderColor = "var(--color-border-strong)";
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.background = "rgba(255,255,255,0.65)";
                (e.target as HTMLElement).style.borderColor = "var(--color-border)";
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div
        className="fixed left-1/2 -translate-x-1/2 z-45 flex items-center"
        style={{
          bottom: 52,
          width: open ? 560 : 220,
          height: open ? 56 : 44,
          backgroundColor: "var(--color-cmd-bg)",
          borderRadius: 999,
          padding: open ? "0 8px 0 20px" : "0 20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          cursor: open ? undefined : "pointer",
          transition: "width 300ms cubic-bezier(0.4,0,0.2,1), height 300ms cubic-bezier(0.4,0,0.2,1), padding 300ms cubic-bezier(0.4,0,0.2,1)",
        }}
        onClick={() => {
          if (!open) onOpenChange(true);
        }}
      >
        {/* Spark prefix */}
        <span
          className="shrink-0"
          style={{
            transition: "transform 300ms ease",
          }}
        >
          <XaviourIcon
            size={open ? 22 : 18}
            animate={loading ? "thinking" : "idle"}
          />
        </span>

        {open ? (
          <>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Xaviour anything..."
              disabled={loading}
              className="flex-1 bg-transparent border-none outline-none font-[var(--font-heading)] text-[15px] text-white placeholder:text-white/40 ml-3"
            />
            {loading ? (
              <span className="text-white/50 text-[14px] font-[var(--font-heading)] mr-3 animate-pulse">
                ···
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmit();
                }}
                className="shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-white/25"
              >
                <Mic size={14} className="text-white/70" />
              </button>
            )}
          </>
        ) : (
          <>
            <span className="font-[var(--font-heading)] text-[13px] text-white/45 ml-2.5 flex-1 select-none">
              ask anything...
            </span>
            <Mic size={14} className="text-white/45 shrink-0" />
          </>
        )}
      </div>
    </>
  );
}
