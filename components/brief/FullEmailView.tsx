"use client";

import { motion } from "framer-motion";
import type { ThreadMessage } from "./EmailModal.types";
import { XaviourMark } from "./XaviourIcon";
import { formatRelativeTime, cleanBody } from "./EmailModal.utils";

interface FullEmailViewProps {
  message: ThreadMessage;
  messageCount: number;
  threadLoading: boolean;
  onClose: () => void;
  onReply: () => void;
  onShowThread: () => void;
  onSummarise: (msg: ThreadMessage) => void;
}

export function FullEmailView({
  message,
  messageCount,
  threadLoading,
  onClose,
  onReply,
  onShowThread,
  onSummarise,
}: FullEmailViewProps) {
  return (
    <motion.div
      className="w-full max-w-2xl mx-2 sm:mx-4"
      style={{ maxHeight: "90vh" }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white/95 backdrop-blur-md rounded-[var(--radius-xl)] shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="shrink-0 p-4 sm:p-8 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(46,107,230,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  className="font-[var(--font-heading)]"
                  style={{ fontSize: "15px", fontWeight: 600, color: "#2E6BE6" }}
                >
                  {message.from.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <span
                  className="font-[var(--font-heading)] text-[15px] font-semibold"
                  style={{ color: "var(--color-text-primary)", display: "block", lineHeight: 1.3 }}
                >
                  {message.from.name}
                </span>
                <span
                  className="font-[var(--font-heading)] text-[12px]"
                  style={{ color: "rgba(10,22,40,0.4)" }}
                >
                  {message.from.email}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(10,22,40,0.06)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                color: "rgba(10,22,40,0.4)",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          <h2
            className="font-[var(--font-heading)] text-[18px] sm:text-[22px] font-bold"
            style={{ color: "var(--color-text-primary)", lineHeight: 1.3, marginBottom: "8px" }}
          >
            {message.subject}
          </h2>

          <div className="flex items-center gap-4 mb-6">
            <span
              className="font-[var(--font-heading)] text-[12px]"
              style={{ color: "rgba(10,22,40,0.4)", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              {formatRelativeTime(message.date)}
            </span>
            {messageCount > 1 && (
              <button
                onClick={onShowThread}
                disabled={threadLoading}
                className="font-[var(--font-heading)] text-[12px] font-medium cursor-pointer"
                style={{
                  color: "#2E6BE6",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "rgba(46,107,230,0.06)",
                  border: "1px solid rgba(46,107,230,0.15)",
                  borderRadius: "999px",
                  padding: "4px 12px",
                  transition: "all 0.15s ease",
                }}
              >
                {threadLoading ? "Loading…" : `↔ ${messageCount} messages`}
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-8">
          <div
            style={{
              background: "rgba(10,22,40,0.025)",
              border: "1px solid rgba(10,22,40,0.06)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <span
              className="font-[var(--font-heading)] text-[14px] font-semibold"
              style={{ color: "var(--color-text-primary)", display: "block", marginBottom: "16px" }}
            >
              Message Content
            </span>
            <p
              className="font-[var(--font-body)] text-[15px] leading-[1.85]"
              style={{ color: "rgba(10,22,40,0.78)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {cleanBody(message.body || message.subject)}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="shrink-0 px-4 sm:px-8 py-4 sm:py-5"
          style={{ borderTop: "1px solid rgba(10,22,40,0.06)" }}
        >
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={onReply}
              className="font-[var(--font-heading)] text-[13px] font-medium"
              style={{
                background: "var(--color-text-primary)",
                color: "white",
                border: "none",
                borderRadius: "999px",
                padding: "9px 20px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              ← Quick Reply
            </button>
            <button
              className="font-[var(--font-heading)] text-[13px]"
              style={{
                background: "transparent",
                color: "rgba(10,22,40,0.5)",
                border: "1px solid rgba(10,22,40,0.12)",
                borderRadius: "999px",
                padding: "9px 20px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              → Forward
            </button>
            <button
              onClick={() => onSummarise(message)}
              className="font-[var(--font-heading)] text-[13px]"
              style={{
                background: "transparent",
                color: "rgba(10,22,40,0.5)",
                border: "1px solid rgba(10,22,40,0.12)",
                borderRadius: "999px",
                padding: "9px 20px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              <XaviourMark size={18} /> Summarize
            </button>
            {messageCount > 1 && (
              <button
                onClick={onShowThread}
                disabled={threadLoading}
                className="font-[var(--font-heading)] text-[13px] font-medium ml-auto"
                style={{
                  background: "rgba(46,107,230,0.06)",
                  color: "#2E6BE6",
                  border: "1px solid rgba(46,107,230,0.18)",
                  borderRadius: "999px",
                  padding: "9px 20px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                {threadLoading ? "Loading…" : `View thread (${messageCount})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
