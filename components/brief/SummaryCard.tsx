"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { EmailBriefItem } from "@/lib/mock-data";
import type { ComposeState } from "./EmailModal.types";
import { InlineAction } from "./InlineAction";

interface SummaryCardProps {
  item: EmailBriefItem;
  compose: ComposeState;
  composeText: string;
  messageCount: number;
  threadLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
  onComposeTextChange: (text: string) => void;
  onSend: () => void;
  onDiscard: () => void;
  onActionClick: (actionLabel: string) => void;
  onShowFullEmail: () => void;
  onShowThread: () => void;
}

export function SummaryCard({
  item,
  compose,
  composeText,
  messageCount,
  threadLoading,
  textareaRef,
  onClose,
  onComposeTextChange,
  onSend,
  onDiscard,
  onActionClick,
  onShowFullEmail,
  onShowThread,
}: SummaryCardProps) {
  const showThreadIndicator = messageCount > 1;

  return (
    <div
      className="bg-white/90 backdrop-blur-md rounded-[var(--radius-xl)] p-10 shadow-2xl shrink-0 flex flex-col overflow-hidden w-full max-w-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Back */}
      <button
        onClick={onClose}
        className="font-[var(--font-heading)] text-[12px] text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text-primary)] transition-colors duration-150 mb-6 shrink-0"
      >
        ← Back
      </button>

      {/* Subject */}
      <h2 className="font-[var(--font-heading)] text-[22px] font-semibold text-[var(--color-text-primary)] mb-2 shrink-0">
        {item.subject || item.rewrittenSubject}
      </h2>

      {/* From */}
      <p className="font-[var(--font-heading)] text-[13px] text-[var(--color-accent-text)] mb-5 shrink-0">
        From: {item.sender.name}
      </p>

      <hr className="border-[var(--color-border)] my-5 shrink-0" />

      {/* Scrollable body area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {compose.mode === "sent" ? (
            <motion.div
              key="sent"
              className="flex items-center justify-center h-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-[var(--font-body)] text-[18px] text-[var(--color-text-body)] italic">
                Sent to {compose.recipientName}. ✓
              </p>
            </motion.div>
          ) : compose.mode === "compose" || compose.mode === "sending" ? (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <p className="font-[var(--font-heading)] text-[12px] text-[var(--color-text-muted)] mb-3">
                Replying to {item.sender.name.split(" ")[0]}
              </p>
              <textarea
                ref={textareaRef}
                value={composeText}
                onChange={(e) => onComposeTextChange(e.target.value)}
                disabled={compose.mode === "sending"}
                className="w-full min-h-[140px] bg-transparent border-none outline-none resize-none font-[var(--font-body)] text-[15px] leading-relaxed text-[var(--color-text-body)] italic placeholder:text-[var(--color-text-muted)]/40"
                placeholder="Write your reply…"
              />
            </motion.div>
          ) : compose.mode === "drafting" ? (
            <motion.div
              key="drafting"
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <p className="font-[var(--font-heading)] text-[13px] text-[var(--color-text-muted)]">
                Drafting reply…
              </p>
            </motion.div>
          ) : (
            <motion.div key="body" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-[var(--font-body)] text-[15px] leading-relaxed text-[var(--color-text-body)] mb-6">
                {item.narrative}
              </p>
              {item.draftedReply && (
                <div className="bg-[var(--color-bg-base)]/60 border-l-2 border-[var(--color-accent)] p-4 rounded-r-lg mb-6">
                  <p className="font-[var(--font-body)] text-[14px] italic text-[var(--color-text-body)] leading-relaxed">
                    {item.draftedReply}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions — pinned to bottom */}
      <div className="flex items-center gap-2 shrink-0 pt-4">
        {compose.mode === "compose" || compose.mode === "sending" ? (
          <>
            <button
              onClick={onSend}
              disabled={compose.mode === "sending" || !composeText.trim()}
              className="inline-flex items-center gap-1 bg-[var(--color-accent)] text-white text-[13px] font-[var(--font-heading)] font-medium py-1.5 px-4 rounded-full transition-all duration-150 cursor-pointer hover:brightness-95 disabled:opacity-50 disabled:cursor-default"
            >
              {compose.mode === "sending" ? "Sending…" : "Confirm & send"}
            </button>
            <button
              onClick={onDiscard}
              disabled={compose.mode === "sending"}
              className="font-[var(--font-heading)] text-[12px] text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text-primary)] transition-colors duration-150 disabled:opacity-50"
            >
              ← discard
            </button>
          </>
        ) : compose.mode === "sent" ? null : compose.mode === "drafting" ? null : (
          <>
            {item.actions
              .filter((a) => a.type !== "open")
              .map((action) => (
                <InlineAction
                  key={action.id}
                  label={action.type === "send" ? "Send this" : action.label}
                  type={action.type}
                  onAction={() => onActionClick(action.label)}
                />
              ))}
            <button
              onClick={onShowFullEmail}
              disabled={threadLoading}
              className="font-[var(--font-heading)] glass-pill border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs py-1 px-3 rounded-full transition-all duration-150 cursor-pointer hover:brightness-95"
            >
              {threadLoading ? "Loading…" : "See full email"}
            </button>
          </>
        )}
      </div>

      {/* Thread indicator */}
      {showThreadIndicator && (
        <div className="mt-4 flex justify-end shrink-0">
          <button
            onClick={onShowThread}
            disabled={threadLoading}
            className="font-[var(--font-heading)] text-[13px] cursor-pointer transition-colors duration-150 bg-transparent border-none p-0"
            style={{ color: "rgba(0,0,0,0.35)" }}
          >
            {threadLoading ? "Loading…" : `↔ ${messageCount} messages`}
          </button>
        </div>
      )}
    </div>
  );
}
