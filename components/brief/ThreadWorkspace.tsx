"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EmailBriefItem } from "@/lib/mock-data";
import { threadSuggestions, defaultThreadSuggestions } from "@/lib/mock-data";
import type { ThreadMessage, AgentDraftState, AssistantHistoryEntry } from "./EmailModal.types";
import type { HandledInfo } from "./EmailModal.types";
import type { TimeSlot } from "./SchedulingContext";
import { SchedulingContext } from "./SchedulingContext";
import XaviourIcon, { XaviourMark } from "./XaviourIcon";
import { formatThreadDate, formatRelativeTime, cleanBody } from "./EmailModal.utils";

// ─── Thread card component ───────────────────────────────────
function ThreadCard({
  msg,
  isSelected,
  isHovered,
  isFocusMode,
  narrative,
  onSelect,
  onHoverStart,
  onHoverEnd,
  onReply,
  onSummarise,
}: {
  msg: ThreadMessage;
  isSelected: boolean;
  isHovered: boolean;
  isFocusMode: boolean;
  narrative: string;
  onSelect: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onReply: () => void;
  onSummarise: () => void;
}) {
  const preview = cleanBody(msg.body || msg.subject).slice(0, 140);
  const fullText = cleanBody(msg.body || msg.subject);
  const isMini = isFocusMode && !isSelected;
  const focusSelectedWidth = "500px";

  return (
    <motion.div
      onClick={onSelect}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className="font-[var(--font-heading)]"
      style={{
        scrollSnapAlign: "start",
        flexShrink: 0,
        width: isMini ? "160px" : isSelected ? (isFocusMode ? "min(500px, calc(100vw - 48px))" : "min(650px, calc(100vw - 48px))") : "min(450px, calc(100vw - 48px))",
        maxHeight: isMini ? "80px" : isSelected ? "100%" : undefined,
        alignSelf: isSelected ? "stretch" : "center",
        background: "white",
        border: isSelected
          ? "1.5px solid rgba(46,107,230,0.35)"
          : isHovered && !isMini
            ? "1px solid rgba(10,22,40,0.25)"
            : "1px solid var(--color-border)",
        borderRadius: isMini ? "12px" : "16px",
        boxShadow: isSelected
          ? "0 16px 48px rgba(10,22,40,0.14), 0 6px 16px rgba(10,22,40,0.07), 0 0 0 3px rgba(46,107,230,0.08)"
          : isHovered && !isMini
            ? "0 8px 28px rgba(10,22,40,0.10), 0 3px 10px rgba(10,22,40,0.05)"
            : isMini
              ? "none"
              : "0 1px 6px rgba(10,22,40,0.04)",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: isMini ? "row" : "column",
        alignItems: isMini ? "center" : undefined,
        overflow: "hidden",
        opacity: isMini ? 0.65 : 1,
        transform: isHovered && !isSelected && !isMini ? "translateY(-3px)" : "translateY(0)",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease, max-height 0.35s ease",
        position: "relative",
      }}
    >
      {/* Hover gradient overlay */}
      {!isMini && (
        <motion.div
          animate={{ opacity: isHovered || isSelected ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            inset: 0,
            background: isSelected
              ? "linear-gradient(135deg, rgba(10,22,40,0.03) 0%, transparent 50%)"
              : "linear-gradient(to right, rgba(10,22,40,0.04) 0%, transparent 60%)",
            borderRadius: "16px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* Mini card layout */}
      {isMini ? (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", width: "100%" }}>
          <div
            style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "rgba(10,22,40,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: "1px",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(10,22,40,0.4)" }}>
              {msg.from.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate text-[12px]" style={{ color: "var(--color-text-primary)", lineHeight: 1.3 }}>
                {msg.from.name.split(" ")[0]}
              </span>
              <span className="text-[10px] shrink-0" style={{ color: "var(--color-text-muted)" }}>
                {formatRelativeTime(msg.date)}
              </span>
            </div>
            <span
              className="font-[var(--font-body)] text-[11px] block truncate"
              style={{ color: "var(--color-text-muted)", marginTop: "2px", lineHeight: 1.4 }}
            >
              {preview.slice(0, 60)}
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Card header */}
          <div style={{ padding: isSelected ? "24px 28px 0" : "20px 20px 0", flexShrink: 0, position: "relative", zIndex: 1 }}>
            <div className="flex items-start gap-3">
              <div
                style={{
                  width: isSelected ? "44px" : "42px",
                  height: isSelected ? "44px" : "42px",
                  borderRadius: "50%",
                  background: isSelected ? "rgba(46,107,230,0.1)" : "rgba(10,22,40,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.3s ease",
                }}
              >
                <span style={{ fontSize: isSelected ? "17px" : "15px", fontWeight: 600, color: isSelected ? "#2E6BE6" : "rgba(10,22,40,0.4)", transition: "all 0.3s ease" }}>
                  {msg.from.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="font-semibold truncate"
                    style={{ fontSize: isSelected ? "15px" : "14px", color: "var(--color-text-primary)", lineHeight: 1.3, display: "block" }}
                  >
                    {msg.from.name}
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--color-text-muted)", flexShrink: 0, whiteSpace: "nowrap" }}>
                    {isSelected ? formatThreadDate(msg.date) : formatRelativeTime(msg.date)}
                  </span>
                </div>
                <span className="text-[11px] block truncate" style={{ color: "var(--color-text-muted)", marginTop: "2px" }}>
                  {msg.from.email}
                </span>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div style={{
            flex: isSelected ? 1 : undefined,
            minHeight: isSelected ? 0 : undefined,
            overflow: "hidden",
            padding: isSelected ? "16px 28px 0" : "14px 20px 0",
            position: "relative", zIndex: 1,
          }}>
            {isSelected ? (
              <div style={{ height: "100%", overflowY: "auto", paddingRight: "4px", paddingBottom: "8px" }}>
                <p
                  className="font-[var(--font-body)] text-[14.5px] leading-[1.8]"
                  style={{ color: "var(--color-text-body)", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}
                >
                  {fullText}
                </p>
              </div>
            ) : (
              <p
                className="font-[var(--font-body)] text-[13.5px] leading-[1.65]"
                style={{
                  color: isHovered ? "var(--color-text-body)" : "var(--color-text-muted)",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  margin: 0,
                  transition: "color 0.25s ease",
                }}
              >
                {preview}
              </p>
            )}
          </div>

          {/* Card footer */}
          {isSelected ? (
            <div
              style={{
                flexShrink: 0, padding: "14px 28px 18px",
                borderTop: "1px solid var(--color-border)", marginTop: "10px",
                display: "flex", alignItems: "center", gap: "8px",
                position: "relative", zIndex: 1,
              }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onReply(); }}
                className="font-[var(--font-heading)] text-[12px] font-medium"
                style={{
                  background: "var(--color-text-primary)", color: "white",
                  border: "none", borderRadius: "999px", padding: "7px 18px",
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px",
                  transition: "all 0.15s ease",
                }}
              >
                ↩ Reply
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="font-[var(--font-heading)] text-[12px]"
                style={{
                  background: "transparent", color: "var(--color-text-muted)",
                  border: "1px solid var(--color-border-strong)", borderRadius: "999px",
                  padding: "7px 18px", cursor: "pointer", display: "inline-flex",
                  alignItems: "center", gap: "5px", transition: "all 0.15s ease",
                }}
              >
                → Forward
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onSummarise(); }}
                className="font-[var(--font-heading)] text-[12px]"
                style={{
                  background: "transparent", color: "var(--color-text-muted)",
                  border: "1px solid var(--color-border-strong)", borderRadius: "999px",
                  padding: "7px 18px", cursor: "pointer", display: "inline-flex",
                  alignItems: "center", gap: "5px", transition: "all 0.15s ease",
                }}
              >
                <XaviourMark size={18} /> Summarize
              </button>
            </div>
          ) : (
            <>
              {/* Hover reveal — AI summary + action buttons */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 14 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden", position: "relative", zIndex: 1, padding: "0 20px" }}
                  >
                    <div style={{ height: "1px", background: "var(--color-border)", marginBottom: "12px" }} />
                    <div style={{ background: "rgba(210,220,235,0.25)", borderRadius: "10px", padding: "10px 14px" }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: "6px" }}>
                        <XaviourMark size={18} />
                        <span className="font-[var(--font-heading)] text-[11px] font-medium" style={{ color: "var(--color-text-muted)" }}>
                          AI Summary
                        </span>
                      </div>
                      <p
                        className="font-[var(--font-body)] text-[13px] leading-[1.55]"
                        style={{
                          color: "var(--color-text-body)", margin: 0,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}
                      >
                        {narrative || preview}
                      </p>
                      <div className="flex items-center gap-2" style={{ marginTop: "8px" }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); onReply(); }}
                          className="font-[var(--font-heading)] text-[11px]"
                          style={{
                            background: "transparent", color: "var(--color-text-muted)",
                            border: "none", borderRadius: "6px", padding: "4px 10px",
                            cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px",
                            transition: "all 0.15s ease",
                          }}
                          onMouseOver={(e) => { (e.target as HTMLElement).style.background = "rgba(10,22,40,0.05)"; }}
                          onMouseOut={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}
                        >
                          ↩ Reply
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="font-[var(--font-heading)] text-[11px]"
                          style={{
                            background: "transparent", color: "var(--color-text-muted)",
                            border: "none", borderRadius: "6px", padding: "4px 10px",
                            cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px",
                            transition: "all 0.15s ease",
                          }}
                          onMouseOver={(e) => { (e.target as HTMLElement).style.background = "rgba(10,22,40,0.05)"; }}
                          onMouseOut={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}
                        >
                          → Forward
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div style={{ height: isHovered ? "10px" : "16px", flexShrink: 0, transition: "height 0.2s ease" }} />
            </>
          )}
        </>
      )}
    </motion.div>
  );
}

// ─── AI Response Zone ────────────────────────────────────────
function AIResponseZone({
  agentDraft,
  cmdResponse,
  cmdAction,
  assistantHistory,
  item,
  forwardRecipient,
  agentDraftText,
  historyRef,
  onSendDraft,
  onRevise,
  onCancelDraft,
  onDismissResponse,
  onOpenDraft,
  onDismissError,
  onDraftTextChange,
  draftEditing,
  onEditDraft,
}: {
  agentDraft: AgentDraftState;
  cmdResponse: string | null;
  cmdAction: Record<string, unknown> | null;
  assistantHistory: AssistantHistoryEntry[];
  item: EmailBriefItem;
  forwardRecipient: { name: string; email: string } | null;
  agentDraftText: React.MutableRefObject<string>;
  historyRef: React.RefObject<HTMLDivElement | null>;
  onSendDraft: () => void;
  onRevise: () => void;
  onCancelDraft: () => void;
  onDismissResponse: () => void;
  onOpenDraft: () => void;
  onDismissError: () => void;
  onDraftTextChange: (text: string) => void;
  draftEditing: boolean;
  onEditDraft?: () => void;
}) {
  return (
    <div style={{ width: "100%", maxWidth: "min(780px, calc(100vw - 32px))", flexShrink: 0, position: "relative", zIndex: 1, marginBottom: "16px" }}>
      {/* Assistant history — faded prior exchanges */}
      {assistantHistory.length > 0 && (
        <div
          ref={historyRef}
          style={{
            width: "100%", maxHeight: "120px", overflowY: "auto", scrollbarWidth: "none",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px 0" }}>
            {assistantHistory.slice(0, -1).map((entry) => (
              <div key={entry.id} style={{ opacity: 0.3, transition: "opacity 0.3s ease" }}>
                <p style={{ margin: 0, lineHeight: 1.9 }}>
                  <span style={{ marginRight: "8px", opacity: 0.6 }}><XaviourMark size={18} /></span>
                  <span className="font-[var(--font-body)]" style={{ fontStyle: "italic", color: "var(--color-text-body)", fontSize: "15px" }}>
                    {entry.response}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline AI response + Agent draft preview */}
      <AnimatePresence mode="wait">
        {(agentDraft.mode === "drafting" || agentDraft.mode === "revising") && (
          <motion.div
            key="agent-drafting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%", flexShrink: 0, padding: "8px 0 20px", position: "relative", zIndex: 1 }}
          >
            <p style={{ margin: 0 }}>
              <span className="mr-1.5"><XaviourIcon size={20} animate="thinking" /></span>
              <span className="font-[var(--font-body)] font-normal italic text-[var(--color-text-muted)] text-[22px] leading-[2.0] animate-pulse">
                {agentDraft.mode === "revising" ? "Revising draft…" : "Drafting a reply…"}
              </span>
            </p>
          </motion.div>
        )}

        {agentDraft.mode === "ready" && (
          <motion.div
            key="agent-draft-ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ width: "100%", flexShrink: 0, padding: "8px 0 20px", position: "relative", zIndex: 1 }}
          >
            {/* Narrative lead-in */}
            <p style={{ margin: "0 0 16px" }}>
              <span className="mr-1.5"><XaviourMark size={20} /></span>
              <span className="font-[var(--font-body)] font-normal italic text-[var(--color-text-muted)] text-[18px] leading-[2.0]">
                {forwardRecipient ? `Here's a note for ${forwardRecipient.name} —` : `Here's a reply for ${item.sender.name.split(" ")[0]} —`}
              </span>
            </p>

            {/* Draft content — narrative preview style, not a boxed textarea */}
            {!draftEditing ? (
              <p
                className="font-[var(--font-body)] font-normal italic text-[var(--color-text-body)] text-[20px] leading-[2.0] cursor-text"
                style={{ margin: 0, paddingLeft: "28px", whiteSpace: "pre-wrap" }}
                onClick={() => onEditDraft?.()}
              >
                {agentDraftText.current}
              </p>
            ) : (
              <textarea
                className="font-[var(--font-body)]"
                value={agentDraftText.current}
                onChange={(e) => onDraftTextChange(e.target.value)}
                autoFocus
                style={{
                  width: "100%", minHeight: "100px", margin: 0,
                  paddingLeft: "28px", paddingRight: "4px", paddingTop: "0", paddingBottom: "0",
                  fontSize: "20px", lineHeight: "2.0", fontStyle: "italic",
                  color: "var(--color-text-body)",
                  whiteSpace: "pre-wrap", background: "transparent", border: "none",
                  outline: "none", resize: "none", fontFamily: "inherit",
                }}
              />
            )}

            {/* Subtle inline actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "18px", paddingLeft: "28px" }}>
              <button
                onClick={onSendDraft}
                className="font-[var(--font-heading)] text-[12px] font-medium"
                style={{
                  color: "#fff", background: "#2E6BE6", border: "none",
                  borderRadius: "999px", padding: "7px 22px", cursor: "pointer",
                  transition: "opacity 0.15s ease",
                }}
                onMouseOver={(e) => { (e.target as HTMLElement).style.opacity = "0.85"; }}
                onMouseOut={(e) => { (e.target as HTMLElement).style.opacity = "1"; }}
              >
                Send →
              </button>
              <button
                onClick={() => { onEditDraft?.(); onRevise(); }}
                className="font-[var(--font-heading)] text-[12px]"
                style={{
                  color: "var(--color-text-muted)", background: "none",
                  border: "none", cursor: "pointer", opacity: 0.55,
                  transition: "opacity 0.15s ease",
                }}
                onMouseOver={(e) => { (e.target as HTMLElement).style.opacity = "0.8"; }}
                onMouseOut={(e) => { (e.target as HTMLElement).style.opacity = "0.55"; }}
              >
                Edit
              </button>
              <button
                onClick={onCancelDraft}
                className="font-[var(--font-heading)] text-[12px]"
                style={{
                  color: "var(--color-text-muted)", background: "none", border: "none",
                  cursor: "pointer", opacity: 0.35, transition: "opacity 0.15s ease",
                }}
                onMouseOver={(e) => { (e.target as HTMLElement).style.opacity = "0.6"; }}
                onMouseOut={(e) => { (e.target as HTMLElement).style.opacity = "0.35"; }}
              >
                Discard
              </button>
            </div>
          </motion.div>
        )}

        {agentDraft.mode === "sending" && (
          <motion.div
            key="agent-sending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%", flexShrink: 0, padding: "8px 0 20px", position: "relative", zIndex: 1 }}
          >
            <p style={{ margin: 0 }}>
              <span className="mr-1.5"><XaviourIcon size={20} animate="pulse" /></span>
              <span className="font-[var(--font-body)] font-normal italic text-[var(--color-text-muted)] text-[22px] leading-[2.0] animate-pulse">
                Sending…
              </span>
            </p>
          </motion.div>
        )}

        {agentDraft.mode === "sent" && (
          <motion.div
            key="agent-sent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ width: "100%", flexShrink: 0, padding: "8px 0 20px", position: "relative", zIndex: 1 }}
          >
            <p style={{ margin: 0 }}>
              <span className="mr-1.5"><XaviourMark size={20} /></span>
              <span className="font-[var(--font-body)] font-normal italic text-[var(--color-text-body)] text-[22px] leading-[2.0]">
                Sent to {agentDraft.recipientName}. ✓
              </span>
            </p>
          </motion.div>
        )}

        {agentDraft.mode === "error" && (
          <motion.div
            key="agent-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%", flexShrink: 0, padding: "8px 0 20px", position: "relative", zIndex: 1 }}
          >
            <p style={{ margin: 0 }}>
              <span className="mr-1.5"><XaviourMark size={20} /></span>
              <span className="font-[var(--font-body)] font-normal italic text-[var(--color-text-muted)] text-[22px] leading-[2.0]">
                {agentDraft.message}
              </span>{" "}
              <button
                onClick={onDismissError}
                className="inline-flex items-center text-[var(--color-text-muted)] text-[13px] font-[var(--font-heading)] ml-1 cursor-pointer hover:opacity-70 transition-opacity duration-150"
                style={{ background: "none", border: "none" }}
              >
                ×
              </button>
            </p>
          </motion.div>
        )}

        {/* Informational AI response — free narrative, no container */}
        {cmdResponse && agentDraft.mode === "idle" && (
          <motion.div
            key="cmd-response"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ width: "100%", flexShrink: 0, padding: "8px 0 20px", position: "relative", zIndex: 1 }}
          >
            <p style={{ margin: 0 }}>
              <span className="mr-1.5"><XaviourMark size={20} animate="idle" /></span>
              <span className="font-[var(--font-body)] font-normal italic text-[var(--color-text-body)] text-[22px] leading-[2.0]">
                {cmdResponse}
              </span>{" "}
              {cmdAction && (cmdAction as Record<string, unknown>).type === "draft" && (
                <button
                  onClick={onOpenDraft}
                  className="font-[var(--font-heading)] text-[11px] font-medium"
                  style={{
                    color: "var(--color-accent-text)", background: "rgba(184,113,31,0.06)",
                    border: "1px solid rgba(184,113,31,0.12)", borderRadius: "999px",
                    padding: "4px 14px", cursor: "pointer", marginLeft: "8px", verticalAlign: "middle",
                  }}
                >
                  Open draft →
                </button>
              )}
              <button
                onClick={onDismissResponse}
                className="inline-flex items-center text-[var(--color-text-muted)] text-[13px] font-[var(--font-heading)] ml-1 cursor-pointer hover:opacity-70 transition-opacity duration-150"
                style={{ background: "none", border: "none" }}
              >
                ×
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ThreadWorkspace export ─────────────────────────────
interface ThreadWorkspaceProps {
  item: EmailBriefItem;
  messages: ThreadMessage[];
  cachedMessage: React.MutableRefObject<ThreadMessage | null>;
  onClose: () => void;
  onBackToFullEmail: () => void;
  onHandled?: (info: HandledInfo) => void;
  onSummaryReply: () => void;
  onSummarise: (msg: ThreadMessage) => void;
}

export function ThreadWorkspace({
  item,
  messages,
  cachedMessage,
  onClose,
  onBackToFullEmail,
  onHandled,
  onSummaryReply,
  onSummarise,
}: ThreadWorkspaceProps) {
  const [selectedThreadMsgId, setSelectedThreadMsgId] = useState<string | null>(messages.length > 0 ? messages[0].id : null);
  const [hoveredThreadMsgId, setHoveredThreadMsgId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [cmdValue, setCmdValue] = useState("");
  const [cmdLoading, setCmdLoading] = useState(false);
  const [cmdResponse, setCmdResponse] = useState<string | null>(null);
  const [cmdAction, setCmdAction] = useState<Record<string, unknown> | null>(null);
  const cmdInputRef = useRef<HTMLInputElement>(null);
  const [agentDraft, setAgentDraft] = useState<AgentDraftState>({ mode: "idle" });
  const agentDraftText = useRef<string>("");
  const [cmdInputFocused, setCmdInputFocused] = useState(false);
  const [forwardRecipient, setForwardRecipient] = useState<{ name: string; email: string } | null>(null);
  const [schedulingOpen, setSchedulingOpen] = useState(false);
  const [assistantHistory, setAssistantHistory] = useState<AssistantHistoryEntry[]>([]);
  const historyRef = useRef<HTMLDivElement>(null);
  const historyIdCounter = useRef(0);
  const [draftEditing, setDraftEditing] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  // Track scroll position of card rail
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    function check() {
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
      setCanScrollLeft(scrollLeft > 8);
    }
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", check); ro.disconnect(); };
  }, [messages]);

  const selectedThreadMsg = messages.find((m) => m.id === selectedThreadMsgId) || null;
  const isFocusMode = agentDraft.mode !== "idle" || cmdLoading || cmdInputFocused || !!cmdResponse;

  const isSchedulingThread = (() => {
    const content = messages.map((m) => m.body.toLowerCase()).join(" ");
    const patterns = [
      /\b(schedule|scheduling|calendar|availability|available|free|slot|meeting|sync|call)\b/,
      /\b(monday|tuesday|wednesday|thursday|friday|next week)\b.*\b(work|free|available|good)\b/,
      /\b\d{1,2}(:\d{2})?\s*(am|pm)\b/,
      /\b(pick a time|find a time|set up a|book a|when.*work|when.*free)\b/,
    ];
    return patterns.some((p) => p.test(content));
  })();

  const pushHistory = useCallback((query: string, response: string, type: AssistantHistoryEntry["type"]) => {
    historyIdCounter.current += 1;
    setAssistantHistory((prev) => [...prev, { id: `h-${historyIdCounter.current}`, query, response, type }]);
    requestAnimationFrame(() => {
      historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  // ⌘K — focus composer
  useEffect(() => {
    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        if (!selectedThreadMsgId && messages.length > 0) {
          setSelectedThreadMsgId(messages[0].id);
        }
        cmdInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleCmdK);
    return () => document.removeEventListener("keydown", handleCmdK);
  }, [selectedThreadMsgId, messages]);

  // Esc — hierarchical navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;

      if (agentDraft.mode === "ready" || agentDraft.mode === "drafting" || agentDraft.mode === "revising") {
        e.stopPropagation();
        setAgentDraft({ mode: "idle" });
        agentDraftText.current = "";
        setForwardRecipient(null);
        return;
      }

      e.stopPropagation();
      if (cachedMessage.current) {
        onBackToFullEmail();
      } else {
        onClose();
      }
      setSelectedThreadMsgId(null);
      setCmdResponse(null);
      setCmdAction(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [agentDraft.mode, cachedMessage, onBackToFullEmail, onClose]);

  // Auto-close after send
  useEffect(() => {
    if (agentDraft.mode === "sent") {
      const timer = setTimeout(onClose, 2200);
      return () => clearTimeout(timer);
    }
  }, [agentDraft.mode, onClose]);

  // ── Intent detection ──
  const detectLocalIntent = useCallback((query: string): "send" | "revision" | "scheduling" | null => {
    const q = query.trim().toLowerCase();
    if (agentDraft.mode === "ready") {
      if (/^(send\s*(it|this)?|yes\s*send|approve|confirm|looks?\s*good|lgtm|ship\s*it|go\s*ahead|do\s*it|yes|yep|yup)(\s*(and\s*)?send)?[.!]?$/i.test(q)) return "send";
      if (/^(make\s*(it\s*)?|shorter|longer|warmer|friendlier|more\s+|less\s+|add\s+|remove\s+|change\s+|sound\s+|tone\s+|rewrite|rephrase|tweak)/i.test(q)) return "revision";
    }
    if (/\b(availab|calendar|schedule|free\s*time|suggest\s*a?\s*(time|slot)|pick\s*a?\s*time|when.*free|show.*slots)\b/i.test(q)) return "scheduling";
    return null;
  }, [agentDraft.mode]);

  // ── Draft generation ──
  const generateAgentDraft = useCallback(async (instruction: string, existingDraft?: string, actionLabel: string = "reply") => {
    setAgentDraft(existingDraft ? { mode: "revising" } : { mode: "drafting" });
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadMessages: messages.map((m) => ({ from: m.from, subject: m.subject, body: m.body, date: m.date })),
          narratorSummary: `${item.sender.name} ${item.narrative}`,
          actionLabel,
          senderName: item.sender.name,
          userInstruction: instruction,
          existingDraft: existingDraft || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const draft = data.draft || "";
        agentDraftText.current = draft;
        setAgentDraft({ mode: "ready", draft });
        setCmdResponse(null);
        setCmdAction(null);
        setDraftEditing(false);
      } else {
        setAgentDraft({ mode: "error", message: "Couldn't generate a draft — try again." });
      }
    } catch {
      setAgentDraft({ mode: "error", message: "Couldn't reach Xaviour." });
    }
  }, [messages, item]);

  // ── Send agent draft ──
  const sendAgentDraft = useCallback(async () => {
    if (!agentDraftText.current.trim()) return;
    setAgentDraft({ mode: "sending" });

    const isForward = !!forwardRecipient;
    const toEmail = isForward ? forwardRecipient!.email : item.sender.email;
    const toName = isForward ? forwardRecipient!.name : item.sender.name;
    const subjectPrefix = isForward ? "Fwd: " : "Re: ";

    try {
      const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : undefined;
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: isForward ? undefined : item.threadId,
          to: toEmail,
          subject: `${subjectPrefix}${item.subject || item.rewrittenSubject}`,
          body: agentDraftText.current,
          replyToMessageId: isForward ? undefined : lastMessageId,
        }),
      });
      if (res.ok) {
        const recipientFirst = toName.split(" ")[0];
        pushHistory("send", isForward ? `Forwarded to ${recipientFirst}.` : `Sent to ${recipientFirst}.`, "status");
        setAgentDraft({ mode: "sent", recipientName: recipientFirst });
        onHandled?.({
          itemId: item.id,
          action: isForward ? "forwarded" : "replied",
          recipientName: recipientFirst,
          recipientEmail: toEmail,
        });
        setForwardRecipient(null);
      } else {
        setAgentDraft({ mode: "error", message: "Send failed — try again." });
      }
    } catch {
      setAgentDraft({ mode: "error", message: "Couldn't send — check connection." });
    }
  }, [messages, item, onHandled, forwardRecipient, pushHistory]);

  const handleSlotSelect = useCallback((_slot: TimeSlot, replySentence: string) => {
    generateAgentDraft(replySentence);
  }, [generateAgentDraft]);

  // ── Command bar submit ──
  const handleCmdSubmit = useCallback(async () => {
    if (!cmdValue.trim() || cmdLoading) return;
    const query = cmdValue.trim();
    setCmdValue("");

    const localIntent = detectLocalIntent(query);
    if (localIntent === "send") { sendAgentDraft(); return; }
    if (localIntent === "revision") {
      pushHistory(query, "Revising draft…", "draft");
      setCmdLoading(true);
      setCmdResponse(null);
      await generateAgentDraft(query, agentDraftText.current);
      setCmdLoading(false);
      return;
    }
    if (localIntent === "scheduling" && isSchedulingThread) { setSchedulingOpen(true); return; }

    setCmdLoading(true);
    const contextStr = selectedThreadMsg ? selectedThreadMsg.body.slice(0, 500) : messages.map((m) => `${m.from.name.split(" ")[0]}: ${m.body.slice(0, 150)}`).join("\n");
    try {
      const res = await fetch("/api/command", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, threadId: item.threadId, context: { threadId: item.threadId, threadContent: contextStr, emails: [{ threadId: item.threadId || "", sender: item.sender.name, senderEmail: item.sender.email, subject: item.subject || item.rewrittenSubject, narrative: contextStr, category: "" }] } }),
      });
      if (res.ok) {
        const data = await res.json();
        const action = data.action || null;

        if (action?.type === "draft" && action?.instruction) {
          const resp = data.response || "Drafting a reply…";
          pushHistory(query, resp, "draft");
          setCmdResponse(resp);
          setCmdAction(null);
          setCmdLoading(false);
          await generateAgentDraft(action.instruction as string);
          return;
        }

        if (action?.type === "forward") {
          const fwdEmail = (action.recipientEmail as string) || "";
          const fwdName = (action.recipientName as string) || "";

          if (!fwdEmail && fwdName) {
            const match = messages.find((m) =>
              m.from.name.toLowerCase().includes(fwdName.toLowerCase()) ||
              m.from.email.toLowerCase().includes(fwdName.toLowerCase())
            );
            if (match) {
              setForwardRecipient({ name: match.from.name, email: match.from.email });
            } else {
              const resp = `I couldn't find an email for "${fwdName}". Try "forward to name@email.com".`;
              pushHistory(query, resp, "error");
              setCmdResponse(resp);
              setCmdAction(null);
              setCmdLoading(false);
              return;
            }
          } else if (fwdEmail) {
            setForwardRecipient({ name: fwdName || fwdEmail.split("@")[0], email: fwdEmail });
          } else {
            const resp = "Who should I forward this to? Try: forward to name@email.com";
            pushHistory(query, resp, "info");
            setCmdResponse(resp);
            setCmdAction(null);
            setCmdLoading(false);
            return;
          }

          const fwdResp = data.response || "Preparing forward…";
          pushHistory(query, fwdResp, "forward");
          setCmdResponse(fwdResp);
          setCmdAction(null);
          setCmdLoading(false);
          await generateAgentDraft(
            (action.instruction as string) || "Write a brief forwarding note",
            undefined,
            "forward"
          );
          return;
        }

        if (data.response) pushHistory(query, data.response, "info");
        setCmdResponse(data.response || null);
        setCmdAction(action);
      } else {
        pushHistory(query, "Something went wrong — try again.", "error");
        setCmdResponse("Something went wrong — try again.");
        setCmdAction(null);
      }
    } catch {
      pushHistory(query, "Couldn't reach Xaviour.", "error");
      setCmdResponse("Couldn't reach Xaviour.");
      setCmdAction(null);
    } finally {
      setCmdLoading(false);
    }
  }, [cmdValue, cmdLoading, detectLocalIntent, sendAgentDraft, generateAgentDraft, selectedThreadMsg, messages, item, pushHistory, isSchedulingThread]);

  const handleCmdOpenDraft = useCallback(() => {
    setSelectedThreadMsgId(null);
    setCmdResponse(null);
    setCmdAction(null);
    onSummaryReply();
  }, [onSummaryReply]);

  // ── Suggestion chip submit ──
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setCmdValue(suggestion);
    requestAnimationFrame(() => {
      setCmdValue(suggestion);
      setTimeout(() => {
        setCmdValue("");
        setCmdLoading(true);
        const contextStr = selectedThreadMsg ? selectedThreadMsg.body.slice(0, 500) : messages.map((m) => `${m.from.name.split(" ")[0]}: ${m.body.slice(0, 150)}`).join("\n");
        fetch("/api/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: suggestion, threadId: item.threadId, context: { threadId: item.threadId, threadContent: contextStr, emails: [{ threadId: item.threadId || "", sender: item.sender.name, senderEmail: item.sender.email, subject: item.subject || item.rewrittenSubject, narrative: contextStr, category: "" }] } }),
        })
          .then((r) => r.json())
          .then((data) => {
            const action = data.action || null;
            if (action?.type === "draft" && action?.instruction) {
              pushHistory(suggestion, data.response || "Drafting…", "draft");
              setCmdResponse(data.response || null);
              setCmdAction(null);
              setCmdLoading(false);
              generateAgentDraft(action.instruction as string);
            } else if (action?.type === "forward") {
              const fwdEmail = (action.recipientEmail as string) || "";
              const fwdName = (action.recipientName as string) || "";
              if (fwdEmail) setForwardRecipient({ name: fwdName || fwdEmail.split("@")[0], email: fwdEmail });
              pushHistory(suggestion, data.response || "Preparing forward…", "forward");
              setCmdResponse(data.response || null);
              setCmdAction(null);
              setCmdLoading(false);
              if (fwdEmail) generateAgentDraft("Write a brief forwarding note", undefined, "forward");
            } else {
              if (data.response) pushHistory(suggestion, data.response, "info");
              setCmdResponse(data.response || null);
              setCmdAction(action);
              setCmdLoading(false);
            }
          })
          .catch(() => {
            setCmdResponse("Couldn't reach Xaviour.");
            setCmdLoading(false);
          });
      }, 80);
    });
  }, [selectedThreadMsg, messages, item, pushHistory, generateAgentDraft]);

  return (
    <motion.div
      className="fixed inset-0 z-50"
      style={{
        background: "var(--color-bg-base)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Ambient blue background wash */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "400px",
          background: "linear-gradient(180deg, rgba(46,107,230,0.055) 0%, rgba(46,107,230,0.02) 50%, transparent 100%)",
          pointerEvents: "none", zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute", top: "80px", left: "50%", transform: "translateX(-50%)",
          width: "900px", height: "400px",
          background: "radial-gradient(ellipse at center, rgba(46,107,230,0.035) 0%, transparent 65%)",
          pointerEvents: "none", zIndex: 0,
        }}
      />

      {/* Header */}
      <div
        style={{
          flexShrink: 0, padding: "20px 16px 16px",
          borderBottom: "1px solid color-mix(in srgb, var(--color-border) 70%, rgba(46,107,230,0.1))",
          position: "relative", zIndex: 1,
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%", textAlign: "center" }}>
          <button
            onClick={() => {
              if (cachedMessage.current) {
                onBackToFullEmail();
              } else {
                onClose();
              }
              setSelectedThreadMsgId(null); setCmdResponse(null); setCmdAction(null);
            }}
            className="font-[var(--font-heading)] text-[12px] cursor-pointer"
            style={{ color: "var(--color-text-muted)", background: "none", border: "none", padding: 0, marginBottom: "14px", display: "block", textAlign: "left" }}
          >
            ← Back
          </button>

          <h1
            className="font-[var(--font-heading)] font-bold"
            style={{ color: "var(--color-text-primary)", lineHeight: 1.2, marginBottom: "10px", fontSize: "clamp(20px, 4vw, 30px)", textAlign: "center", paddingRight: "40px" }}
          >
            {item.subject || item.rewrittenSubject}
          </h1>

          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap" style={{ marginTop: "2px" }}>
            <div
              style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "rgba(46,107,230,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              <span className="font-[var(--font-heading)]" style={{ fontSize: "12px", fontWeight: 600, color: "#2E6BE6" }}>
                {item.sender.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-[var(--font-heading)] text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>
              {item.sender.name}
            </span>
            <span className="font-[var(--font-heading)] text-[11px] sm:text-[12px] hidden sm:inline" style={{ color: "var(--color-text-muted)" }}>
              {item.sender.email}
            </span>
            <span
              className="font-[var(--font-heading)] text-[11px]"
              style={{ color: "var(--color-text-muted)", background: "rgba(10,22,40,0.04)", borderRadius: "999px", padding: "2px 10px" }}
            >
              {messages.length} messages
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "20px", right: "16px",
            width: "36px", height: "36px", borderRadius: "50%",
            background: "rgba(10,22,40,0.05)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", color: "var(--color-text-muted)",
          }}
        >
          ✕
        </button>
      </div>

      {/* Workspace */}
      <div
        style={{
          flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "12px 16px 24px", gap: "0",
          position: "relative", zIndex: 1, overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", top: "-80px", left: "50%", transform: "translateX(-50%)",
            width: "800px", height: "350px",
            background: "radial-gradient(ellipse at center top, rgba(46,107,230,0.05) 0%, transparent 65%)",
            pointerEvents: "none", zIndex: 0,
          }}
        />

        {/* AI Response Zone */}
        <AIResponseZone
          agentDraft={agentDraft}
          cmdResponse={cmdResponse}
          cmdAction={cmdAction}
          assistantHistory={assistantHistory}
          item={item}
          forwardRecipient={forwardRecipient}
          agentDraftText={agentDraftText}
          historyRef={historyRef}
          onSendDraft={sendAgentDraft}
          onRevise={() => cmdInputRef.current?.focus()}
          onCancelDraft={() => { setAgentDraft({ mode: "idle" }); agentDraftText.current = ""; setCmdResponse(null); setForwardRecipient(null); setDraftEditing(false); }}
          onDismissResponse={() => { setCmdResponse(null); setCmdAction(null); }}
          onOpenDraft={handleCmdOpenDraft}
          onDismissError={() => setAgentDraft({ mode: "idle" })}
          onDraftTextChange={(text) => { agentDraftText.current = text; setAgentDraft({ mode: "ready", draft: text }); }}
          draftEditing={draftEditing}
          onEditDraft={() => setDraftEditing(true)}
        />

        {/* Main content row */}
        <div style={{ flexShrink: 1, minHeight: 0, display: "flex", flexDirection: "row", gap: "20px", width: "100%", position: "relative", zIndex: 1 }}>
          {/* Cards column */}
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            {/* Card rail */}
            <div
              ref={timelineRef}
              className="thread-timeline"
              style={{
                display: "flex",
                gap: isFocusMode ? "10px" : "24px",
                overflowX: "auto", overflowY: "hidden",
                scrollSnapType: "x mandatory",
                scrollbarWidth: "none", msOverflowStyle: "none",
                alignItems: isFocusMode ? "stretch" : "center",
                padding: isFocusMode ? "4px 6px 4px" : "6px 6px 8px",
                maxWidth: "100%",
                maxHeight: isFocusMode ? "220px" : "calc(100% - 80px)",
                flexShrink: isFocusMode ? 0 : undefined,
                transition: "gap 0.35s ease, max-height 0.4s ease, padding 0.35s ease",
              }}
            >
              {messages.map((msg) => (
                <ThreadCard
                  key={msg.id}
                  msg={msg}
                  isSelected={msg.id === selectedThreadMsgId}
                  isHovered={msg.id === hoveredThreadMsgId && msg.id !== selectedThreadMsgId}
                  isFocusMode={isFocusMode}
                  narrative={item.narrative}
                  onSelect={() => setSelectedThreadMsgId(msg.id === selectedThreadMsgId ? null : msg.id)}
                  onHoverStart={() => setHoveredThreadMsgId(msg.id)}
                  onHoverEnd={() => setHoveredThreadMsgId(null)}
                  onReply={() => { setSelectedThreadMsgId(msg.id); onSummaryReply(); }}
                  onSummarise={() => onSummarise(msg)}
                />
              ))}
            </div>

            {/* Scroll hint — mobile only, shows when cards overflow */}
            {(canScrollLeft || canScrollRight) && (
              <div
                className="font-[var(--font-heading)] flex sm:hidden"
                style={{
                  alignItems: "center", gap: "8px",
                  flexShrink: 0, marginTop: "-4px", marginBottom: "4px",
                }}
              >
                {canScrollLeft && (
                  <button
                    onClick={() => timelineRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
                    style={{
                      background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "999px", padding: "4px 12px", cursor: "pointer",
                      color: "rgba(255,255,255,0.45)", fontSize: "11px", transition: "all 0.15s ease",
                    }}
                  >
                    ← earlier
                  </button>
                )}
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>
                  swipe to see all
                </span>
                {canScrollRight && (
                  <button
                    onClick={() => timelineRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
                    style={{
                      background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "999px", padding: "4px 12px", cursor: "pointer",
                      color: "rgba(255,255,255,0.45)", fontSize: "11px", transition: "all 0.15s ease",
                    }}
                  >
                    newer →
                  </button>
                )}
              </div>
            )}

            {/* Scheduling hint */}
            {isSchedulingThread && !schedulingOpen && agentDraft.mode === "idle" && (
              <button
                onClick={() => setSchedulingOpen(true)}
                className="font-[var(--font-heading)] text-[12px] font-medium"
                style={{
                  color: "var(--color-accent-text)", background: "rgba(46,107,230,0.06)",
                  border: "1px solid rgba(46,107,230,0.12)", borderRadius: "14px",
                  padding: "8px 18px", cursor: "pointer", flexShrink: 0,
                  display: "flex", alignItems: "center", gap: "8px", transition: "all 0.25s ease",
                }}
                onMouseOver={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "rgba(46,107,230,0.10)";
                  el.style.borderColor = "rgba(46,107,230,0.2)";
                  el.style.boxShadow = "0 4px 16px rgba(46,107,230,0.08)";
                }}
                onMouseOut={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "rgba(46,107,230,0.06)";
                  el.style.borderColor = "rgba(46,107,230,0.12)";
                  el.style.boxShadow = "none";
                }}
              >
                <XaviourMark size={20} />
                Show availability
              </button>
            )}

            {/* Thread suggestion chips */}
            {agentDraft.mode === "idle" && !cmdLoading && !cmdResponse && !cmdValue.trim() && assistantHistory.length === 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", flexShrink: 0, marginBottom: "10px", maxWidth: "min(540px, calc(100vw - 48px))", width: "100%" }}>
                {(threadSuggestions[item.threadId || ""] || defaultThreadSuggestions).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="font-[var(--font-heading)] text-[11px] cursor-pointer"
                    style={{
                      color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: "999px",
                      padding: "5px 14px", transition: "all 0.15s ease", whiteSpace: "nowrap",
                    }}
                    onMouseOver={(e) => {
                      (e.target as HTMLElement).style.background = "rgba(255,255,255,0.15)";
                      (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
                      (e.target as HTMLElement).style.color = "rgba(255,255,255,0.8)";
                    }}
                    onMouseOut={(e) => {
                      (e.target as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                      (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                      (e.target as HTMLElement).style.color = "rgba(255,255,255,0.55)";
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Xaviour AI Thread Companion — command bar */}
            <div
              className="xav-cmd-bar"
              style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: "10px",
                background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, var(--color-cmd-bg) 35%)",
                borderRadius: "999px", padding: "12px 12px 12px 22px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)",
                width: "100%", maxWidth: "min(540px, calc(100vw - 48px))", transition: "box-shadow 300ms ease, transform 200ms ease",
              }}
            >
              <span className="shrink-0">
                <XaviourIcon size={18} animate={cmdLoading ? "thinking" : "idle"} />
              </span>

              {selectedThreadMsg && (
                <span
                  className="font-[var(--font-heading)] text-[11px] font-medium shrink-0"
                  style={{
                    color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.1)",
                    borderRadius: "999px", padding: "3px 12px", whiteSpace: "nowrap",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {selectedThreadMsg.from.name.split(" ")[0]}
                </span>
              )}

              <input
                ref={cmdInputRef}
                type="text"
                value={cmdValue}
                onChange={(e) => setCmdValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleCmdSubmit(); } }}
                onFocus={() => setCmdInputFocused(true)}
                onBlur={() => setCmdInputFocused(false)}
                placeholder={agentDraft.mode === "ready" ? `"send it", "make it shorter", or revise…` : selectedThreadMsg ? `Ask about this message…` : "Reply, ask, or instruct Xaviour…"}
                disabled={cmdLoading}
                className="font-[var(--font-heading)] text-[14px] placeholder:text-white/35"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", caretColor: "var(--color-accent)", minWidth: 0 }}
              />

              {cmdLoading ? (
                <span className="text-white/50 text-[14px] font-[var(--font-heading)] mr-2 animate-pulse">···</span>
              ) : cmdValue.trim() ? (
                <button
                  onClick={handleCmdSubmit}
                  className="shrink-0 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-white/25"
                >
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px" }}>↵</span>
                </button>
              ) : (
                <div className="shrink-0 w-9 h-9 rounded-full bg-white/8 flex items-center justify-center" style={{ opacity: 0.4 }}>
                  <span style={{ color: "white", fontSize: "11px", letterSpacing: "0.5px" }}>⌘K</span>
                </div>
              )}
            </div>
          </div>

          {/* Scheduling panel */}
          <AnimatePresence>
            {schedulingOpen && (
              <motion.div
                key="scheduling-side"
                initial={{ opacity: 0, x: 20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 320 }}
                exit={{ opacity: 0, x: 20, width: 0 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                style={{ flexShrink: 0, overflow: "hidden", alignSelf: "flex-start" }}
              >
                <div
                  style={{
                    width: "300px", background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                    borderRadius: "20px", border: "1px solid rgba(10,22,40,0.08)",
                    boxShadow: "0 12px 40px rgba(10,22,40,0.08), 0 4px 12px rgba(10,22,40,0.04)",
                    padding: "4px 20px 20px", position: "relative",
                  }}
                >
                  <button
                    onClick={() => setSchedulingOpen(false)}
                    className="font-[var(--font-heading)]"
                    style={{
                      position: "absolute", top: "16px", right: "14px",
                      width: "26px", height: "26px", borderRadius: "50%",
                      background: "rgba(10,22,40,0.04)", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", color: "var(--color-text-muted)", transition: "background 0.15s ease",
                    }}
                    onMouseOver={(e) => { (e.target as HTMLElement).style.background = "rgba(10,22,40,0.08)"; }}
                    onMouseOut={(e) => { (e.target as HTMLElement).style.background = "rgba(10,22,40,0.04)"; }}
                  >
                    ×
                  </button>
                  <SchedulingContext
                    isSchedulingEmail={true}
                    title="Available times"
                    senderName={item.sender.name}
                    onSlotSelect={(slot, sentence) => { handleSlotSelect(slot, sentence); setSchedulingOpen(false); }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
