"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────

export interface StoryMessage {
  id: string;
  threadId: string;
  date: string;
  from: { name: string; email: string };
  subject: string;
  body: string;
}

interface StoriesViewerProps {
  messages: StoryMessage[];
  threadId: string;
  subject: string;
  /** External sender's email — messages from this address show "Reply with draft" */
  externalSenderEmail?: string;
  onFocusChange?: (message: StoryMessage | null) => void;
  /** Called when user clicks "Summarise thread" — parent handles API call + bubble */
  onSummarise?: (msg: StoryMessage) => void;
  /** Called when user clicks Reply on a card — parent opens draft flow */
  onReply?: (msg: StoryMessage) => void;
}

// ─── Helpers ────────────────────────────────────────────────────

function fmtCompact(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  } catch {
    return dateStr;
  }
}

function fmtRelative(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    return `${d.getDate()} ${mon}`;
  } catch {
    return dateStr;
  }
}

function fmtFull(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    return `${day} ${d.getDate()} ${mon}, ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  } catch {
    return dateStr;
  }
}

function cleanBody(body: string): string {
  // Strip leading "Body:" or "Subject:" prefix
  let text = (body || "").replace(/^(Body:|Subject:[^\n]*\n?)/gim, "");
  // Strip quoted reply chains and forwarded blocks
  text = text.replace(/On .{0,120}wrote:\s*/gm, "");
  text = text.replace(/[-_]{3,}[\s\S]*/m, "");
  text = text.replace(/Forwarded message[\s\S]*/im, "");
  // Strip HTML tags
  text = text.replace(/<[^>]+>/g, "");
  // Line-by-line cleanup
  const lines = text.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("Sent from")) break;
    if (t.startsWith("From:") && t.includes("<")) break;
    if (t.startsWith(">")) continue;
    out.push(line);
  }
  while (out.length > 0 && out[out.length - 1].trim() === "") out.pop();
  return out.join("\n") || body;
}

function snip(body: string, max = 120): string {
  const c = cleanBody(body).replace(/\n+/g, " ").trim();
  return c.length > max ? c.slice(0, max) + "…" : c;
}

const GHOST_PILL: React.CSSProperties = {
  background: "transparent",
  color: "rgba(10,22,40,0.4)",
  border: "1px solid rgba(10,22,40,0.1)",
  borderRadius: "999px",
  padding: "9px 22px",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const HOVER_BTN: React.CSSProperties = {
  color: "rgba(10,22,40,0.4)",
  background: "rgba(10,22,40,0.03)",
  border: "none",
  borderRadius: "8px",
  padding: "5px 12px",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

// ─── Component ──────────────────────────────────────────────────

export function StoriesViewer({
  messages,
  threadId,
  subject,
  externalSenderEmail,
  onFocusChange,
  onSummarise,
  onReply,
}: StoriesViewerProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showDraft, setShowDraft] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);
  const draftRef = useRef<HTMLTextAreaElement>(null);

  // Reset draft when focused card changes
  useEffect(() => {
    setShowDraft(false);
    setDraftText("");
  }, [focusedIndex]);

  // Notify parent of focus changes
  useEffect(() => {
    onFocusChange?.(focusedIndex !== null ? messages[focusedIndex] ?? null : null);
  }, [focusedIndex, messages, onFocusChange]);

  // Esc — hierarchical: draft → unfocus card
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showDraft) {
        e.stopPropagation();
        setShowDraft(false);
      } else if (focusedIndex !== null) {
        e.stopPropagation();
        setFocusedIndex(null);
      }
    };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  }, [showDraft, focusedIndex]);

  // Focus textarea when draft opens
  useEffect(() => {
    if (showDraft && draftRef.current) draftRef.current.focus();
  }, [showDraft]);

  const isReceived = useCallback(
    (msg: StoryMessage) => {
      if (!externalSenderEmail) return true;
      return msg.from.email.toLowerCase() === externalSenderEmail.toLowerCase();
    },
    [externalSenderEmail]
  );

  // ── Reply with draft ──
  const handleReplyDraft = useCallback(
    async (msg: StoryMessage) => {
      setShowDraft(true);
      setDraftLoading(true);
      try {
        const res = await fetch("/api/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            threadId,
            threadMessages: messages.map((m) => ({
              from: m.from,
              subject: m.subject,
              body: m.body,
              date: m.date,
            })),
            narratorSummary: "",
            actionLabel: "reply",
            senderName: msg.from.name,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setDraftText(data.draft || "");
        }
      } catch {
        /* user can type manually */
      } finally {
        setDraftLoading(false);
      }
    },
    [threadId, messages]
  );

  // ── Send ──
  const handleSend = useCallback(
    async (msg: StoryMessage) => {
      if (!draftText.trim()) return;
      try {
        await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: msg.from.email,
            subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
            body: draftText,
            threadId,
            replyToMessageId: msg.id,
          }),
        });
        setShowDraft(false);
        setDraftText("");
        setTimeout(() => setFocusedIndex(null), 1500);
      } catch {
        /* stay in draft on error */
      }
    },
    [draftText, threadId, subject]
  );

  // ─── Focused message reference ─────────────────────────────────

  const focusedMsg = focusedIndex !== null ? messages[focusedIndex] : null;
  const focusedReceived = focusedMsg ? isReceived(focusedMsg) : true;
  const focusedFirstName = focusedMsg?.from.name.split(" ")[0] ?? "";

  // ─── Render ───────────────────────────────────────────────────

  const isAnyFocused = focusedIndex !== null;

  return (
    <div style={{ minHeight: "220px", background: "linear-gradient(160deg, #E8F4FD 0%, #dbeafe 100%)", borderRadius: "16px" }}>
      {/* ── Layer 1: Strip — horizontal scrollable story cards ── */}
      <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-5 pb-4 pt-2 items-start" style={{ padding: "8px 48px 16px", justifyContent: "center" }}>
          {messages.map((msg, i) => {
            const received = isReceived(msg);
            const isHovered = hoveredIndex === i && !isAnyFocused;

            return (
              <div
                key={msg.id}
                style={{
                  flex: "0 0 400px",
                  width: "400px",
                  borderRadius: "22px",
                  background: "rgba(255,255,255,0.92)",
                  border: "1px solid rgba(255,255,255,0.95)",
                  boxShadow: isHovered
                    ? "0 8px 32px rgba(10,22,40,0.14), 0 0 0 1px rgba(46,107,230,0.12)"
                    : "0 2px 16px rgba(10,22,40,0.06)",
                  cursor: "pointer",
                  overflow: "hidden",
                  opacity: isAnyFocused ? 0.15 : 1,
                  pointerEvents: isAnyFocused ? "none" : "auto",
                  transition: "box-shadow 0.3s ease, opacity 0.4s ease",
                }}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => { if ((e.target as HTMLElement).closest('.hover-section')) return; setFocusedIndex(i); }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* ── Section A: Always visible — sender, subject, preview ── */}
                <div style={{ padding: "22px 24px 18px" }}>
                  {/* Row: sender + timestamp */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* Avatar circle */}
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: received ? "rgba(46,107,230,0.08)" : "rgba(10,22,40,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          className="font-[var(--font-heading)]"
                          style={{ fontSize: "13px", fontWeight: 600, color: received ? "#2E6BE6" : "rgba(10,22,40,0.35)" }}
                        >
                          {msg.from.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span
                          className="font-[var(--font-heading)] text-[13px] font-semibold"
                          style={{ color: "var(--color-text-primary)", display: "block", lineHeight: 1.2 }}
                        >
                          {msg.from.name}
                        </span>
                        <span
                          className="font-[var(--font-heading)] text-[11px]"
                          style={{ color: "rgba(10,22,40,0.35)" }}
                        >
                          {fmtRelative(msg.date)}
                        </span>
                      </div>
                    </div>
                    {/* Message count badge */}
                    {messages.length > 1 && (
                      <span
                        className="font-[var(--font-heading)] text-[11px]"
                        style={{
                          color: "rgba(10,22,40,0.35)",
                          background: "rgba(10,22,40,0.04)",
                          borderRadius: "6px",
                          padding: "2px 7px",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}/{messages.length}
                      </span>
                    )}
                  </div>

                  {/* Subject — bold heading, truncated single line */}
                  <h3
                    className="font-[var(--font-heading)] text-[15px] font-semibold"
                    style={{
                      color: "var(--color-text-primary)",
                      marginBottom: "8px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {msg.subject}
                  </h3>

                  {/* Preview — body text, 2-line clamp */}
                  <p
                    className="font-[var(--font-body)] text-[14px] leading-[1.65]"
                    style={{
                      color: "rgba(10,22,40,0.5)",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {snip(msg.body || msg.subject, 140)}
                  </p>
                </div>

                {/* ── Section B: Hover reveal — card unfolds downward ── */}
                <div
                  className={`hover-section grid transition-[grid-template-rows] duration-[320ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                    isHovered ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    {/* Fold divider */}
                    <div style={{ height: "1px", background: "rgba(10,22,40,0.05)", margin: "0 24px" }} />

                    <div style={{ padding: "12px 24px 18px" }}>
                      {/* Actions */}
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button className="font-[var(--font-heading)] text-[11px]" style={HOVER_BTN} onClick={(e) => { e.stopPropagation(); setFocusedIndex(i); handleReplyDraft(msg); }}>Reply</button>
                        <button className="font-[var(--font-heading)] text-[11px]" style={HOVER_BTN} onClick={(e) => { e.stopPropagation(); setFocusedIndex(i); }}>Forward</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Layer 2: Focus overlay — full viewport, floats above everything ── */}
      {focusedMsg && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
          {/* Soft white backdrop — seamless with thread mode's light bg */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(245,243,240,0.6)", backdropFilter: "blur(6px)" }}
            onClick={() => { setFocusedIndex(null); setShowDraft(false); }}
          />

          {/* The focus panel */}
          <div
            key={focusedIndex}
            className="relative z-[75] xav-focus-panel-in"
            style={{
              width: "min(680px, calc(100vw - 48px))",
              maxHeight: "80vh",
              borderRadius: "24px",
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 24px 64px rgba(10,22,40,0.18), 0 0 0 1px rgba(255,255,255,0.8)",
              padding: "32px 36px 28px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header: sender + timestamp + close */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0, marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: focusedReceived ? "rgba(46,107,230,0.08)" : "rgba(10,22,40,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span className="font-[var(--font-heading)]" style={{ fontSize: "14px", fontWeight: 600, color: focusedReceived ? "#2E6BE6" : "rgba(10,22,40,0.35)" }}>{focusedMsg.from.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <span className="font-[var(--font-heading)] text-[14px] font-semibold" style={{ color: "var(--color-text-primary)", display: "block", lineHeight: 1.3 }}>{focusedMsg.from.name}</span>
                  <span className="font-[var(--font-heading)] text-[12px]" style={{ color: "rgba(10,22,40,0.35)" }}>{fmtFull(focusedMsg.date)}</span>
                </div>
              </div>
              <button onClick={() => { setFocusedIndex(null); setShowDraft(false); }} style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(10,22,40,0.06)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "rgba(10,22,40,0.35)" }}>✕</button>
            </div>

            {/* Subject */}
            <h2
              className="font-[var(--font-heading)] text-[20px] font-semibold"
              style={{ color: "var(--color-text-primary)", marginBottom: "16px", flexShrink: 0, lineHeight: 1.3 }}
            >
              {focusedMsg.subject}
            </h2>

            {/* Divider */}
            <div style={{ height: "1px", background: "rgba(10,22,40,0.06)", marginBottom: "20px", flexShrink: 0 }} />

            {/* Body — scrollable reading area */}
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "4px" }}>
              <p
                className="font-[var(--font-body)] text-[16px] leading-[1.85]"
                style={{ color: "rgba(10,22,40,0.78)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
              >
                {cleanBody(focusedMsg.body || focusedMsg.subject)}
              </p>
            </div>

            {/* Action pills */}
            <div style={{ marginTop: "24px", display: "flex", gap: "8px", flexShrink: 0 }}>
              {focusedReceived ? (
                <>
                  <button
                    onClick={() => handleReplyDraft(focusedMsg)}
                    disabled={draftLoading}
                    className="font-[var(--font-heading)] text-[13px] font-medium"
                    style={{ background: "#2E6BE6", color: "white", border: "none", borderRadius: "999px", padding: "9px 22px", cursor: draftLoading ? "default" : "pointer", opacity: draftLoading ? 0.6 : 1, transition: "all 0.15s ease" }}
                  >
                    {draftLoading ? "Drafting…" : "Reply with draft"}
                  </button>
                  <button className="font-[var(--font-heading)] text-[13px]" style={GHOST_PILL} onClick={() => onSummarise?.(focusedMsg)}>Summarise thread</button>
                </>
              ) : (
                <>
                  <button className="font-[var(--font-heading)] text-[13px]" style={GHOST_PILL} onClick={() => onSummarise?.(focusedMsg)}>Summarise thread</button>
                  <button className="font-[var(--font-heading)] text-[13px]" style={GHOST_PILL}>Forward this</button>
                </>
              )}
            </div>

            {/* ── Draft area — CSS grid transition (preserved exactly) ── */}
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-250 ease ${
                showDraft ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
              style={{ flexShrink: 0 }}
            >
              <div className="overflow-hidden">
                <div
                  style={{
                    paddingTop: "16px",
                    marginTop: "16px",
                    borderTop: "1px solid rgba(10,22,40,0.06)",
                  }}
                >
                  <p
                    className="font-[var(--font-heading)] text-[11px]"
                    style={{ color: "rgba(10,22,40,0.28)", marginBottom: "8px" }}
                  >
                    Replying to {focusedFirstName}
                  </p>
                  <textarea
                    ref={draftRef}
                    className="font-[var(--font-body)] italic text-[14px] leading-[1.7]"
                    style={{
                      width: "100%",
                      color: "rgba(10,22,40,0.8)",
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      resize: "none",
                      minHeight: "72px",
                    }}
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder={draftLoading ? "Drafting…" : "Write your reply…"}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "12px",
                      marginTop: "10px",
                      alignItems: "center",
                    }}
                  >
                    <button
                      className="font-[var(--font-heading)] text-[12px]"
                      style={{
                        color: "rgba(10,22,40,0.32)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowDraft(false)}
                    >
                      ← discard
                    </button>
                    <button
                      className="font-[var(--font-heading)] text-[12px] font-medium"
                      style={{
                        background: "#2E6BE6",
                        color: "white",
                        borderRadius: "999px",
                        padding: "7px 18px",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSend(focusedMsg)}
                    >
                      Confirm &amp; send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
