"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EmailBriefItem } from "@/lib/mock-data";
import type { ThreadMessage, ModalView, ComposeState } from "./EmailModal.types";
import { FullEmailView } from "./FullEmailView";
import { SummaryCard } from "./SummaryCard";
import { ThreadWorkspace } from "./ThreadWorkspace";

// Re-export for consumers (AmbientBrief.tsx)
export type { HandledInfo } from "./EmailModal.types";

interface EmailModalProps {
  item: EmailBriefItem;
  autoReply?: boolean;
  onClose: () => void;
  onHandled?: (info: import("./EmailModal.types").HandledInfo) => void;
}

export function EmailModal({ item, autoReply, onClose, onHandled }: EmailModalProps) {
  const [modalView, setModalView] = useState<ModalView>({ mode: "summary" });
  const [threadLoading, setThreadLoading] = useState(false);
  const [compose, setCompose] = useState<ComposeState>({ mode: "idle" });
  const [composeText, setComposeText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cachedMessage = useRef<ThreadMessage | null>(null);
  const messageCount = item.messageCount ?? 1;

  // Auto-open fullEmail on mount (skip if autoReply)
  const autoOpenTriggered = useRef(false);
  useEffect(() => {
    if (!autoReply && !autoOpenTriggered.current && item.threadId) {
      autoOpenTriggered.current = true;
      handleShowFullEmail();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-close after send success
  useEffect(() => {
    if (compose.mode === "sent") {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [compose.mode, onClose]);

  // Focus textarea when compose opens
  useEffect(() => {
    if (compose.mode === "compose" && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [compose.mode]);

  // Esc — hierarchical navigation (summary/fullEmail levels only; thread level handled by ThreadWorkspace)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (modalView.mode === "thread") return; // ThreadWorkspace handles its own Esc

      if (compose.mode === "compose" || compose.mode === "drafting") {
        e.stopPropagation();
        handleDiscard();
        return;
      }

      if (modalView.mode === "fullEmail") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (modalView.mode === "summary") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [compose.mode, modalView.mode, onClose]);

  // ── Thread messages for current view ──
  const threadMessages = modalView.mode === "thread" ? modalView.messages : [];

  // ── Fetch AI draft and enter compose mode ──
  const handleActionClick = useCallback(async (actionLabel: string) => {
    setCompose({ mode: "drafting", actionLabel });
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadMessages: threadMessages.map((m) => ({
            from: m.from, subject: m.subject, body: m.body, date: m.date,
          })),
          narratorSummary: `${item.sender.name} ${item.narrative}`,
          actionLabel,
          senderName: item.sender.name,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setComposeText(data.draft || "");
        setCompose({ mode: "compose", draft: data.draft || "", actionLabel });
      } else {
        setComposeText(item.draftedReply || "");
        setCompose({ mode: "compose", draft: item.draftedReply || "", actionLabel });
      }
    } catch {
      setComposeText(item.draftedReply || "");
      setCompose({ mode: "compose", draft: item.draftedReply || "", actionLabel });
    }
  }, [threadMessages, item]);

  // Auto-reply: trigger draft generation on mount
  const autoReplyTriggered = useRef(false);
  useEffect(() => {
    if (autoReply && !autoReplyTriggered.current) {
      autoReplyTriggered.current = true;
      handleActionClick("reply");
    }
  }, [autoReply, handleActionClick]);

  // ── Send the composed reply ──
  const handleSend = useCallback(async () => {
    if (!composeText.trim()) return;
    setCompose({ mode: "sending" });
    try {
      const lastMessageId = threadMessages.length > 0
        ? threadMessages[threadMessages.length - 1].id
        : undefined;
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: item.threadId,
          to: item.sender.email,
          subject: `Re: ${item.subject || item.rewrittenSubject}`,
          body: composeText,
          replyToMessageId: lastMessageId,
        }),
      });
      if (res.ok) {
        setCompose({ mode: "sent", recipientName: item.sender.name.split(" ")[0] });
        onHandled?.({ itemId: item.id, action: "replied", recipientName: item.sender.name.split(" ")[0], recipientEmail: item.sender.email });
      } else {
        const data = await res.json();
        console.error("Send failed:", data.error);
        setCompose({ mode: "compose", draft: composeText, actionLabel: "reply" });
      }
    } catch (err) {
      console.error("Send error:", err);
      setCompose({ mode: "compose", draft: composeText, actionLabel: "reply" });
    }
  }, [composeText, threadMessages, item, onHandled]);

  const handleDiscard = useCallback(() => {
    setCompose({ mode: "idle" });
    setComposeText("");
  }, []);

  // ── Fetch full email ──
  const handleShowFullEmail = async () => {
    if (!item.threadId) return;
    setThreadLoading(true);
    try {
      const res = await fetch(`/api/thread/${item.threadId}`);
      if (res.ok) {
        const data = await res.json();
        const messages: ThreadMessage[] = data.messages || [];
        if (messages.length > 0) {
          cachedMessage.current = messages[0];
          setModalView({ mode: "fullEmail", message: messages[0] });
        }
      }
    } catch (err) {
      console.error("Failed to fetch email:", err);
    } finally {
      setThreadLoading(false);
    }
  };

  // ── Fetch thread ──
  const handleShowThread = async () => {
    if (!item.threadId) return;
    setThreadLoading(true);
    try {
      const res = await fetch(`/api/thread/${item.threadId}`);
      if (res.ok) {
        const data = await res.json();
        const msgs: ThreadMessage[] = data.messages || [];
        setModalView({ mode: "thread", messages: msgs });
      }
    } catch (err) {
      console.error("Failed to fetch thread:", err);
    } finally {
      setThreadLoading(false);
    }
  };

  // ── Summarise a message ──
  const handleSummarise = useCallback(async (msg: ThreadMessage) => {
    // This is a simplified passthrough — ThreadWorkspace has its own full implementation
    const ctx = msg.body.slice(0, 500);
    try {
      const res = await fetch("/api/command", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `Summarise this email from ${msg.from.name}`, threadId: item.threadId, context: { threadId: item.threadId, threadContent: ctx, emails: [{ threadId: item.threadId || "", sender: msg.from.name, senderEmail: msg.from.email, subject: msg.subject, narrative: ctx, category: "" }] } }),
      });
      if (res.ok) {
        // Response handled by the calling view
      }
    } catch {
      // Silently handled
    }
  }, [item]);

  // ── Render ──
  if (modalView.mode === "thread") {
    return (
      <AnimatePresence>
        <ThreadWorkspace
          item={item}
          messages={modalView.messages}
          cachedMessage={cachedMessage}
          onClose={onClose}
          onBackToFullEmail={() => {
            if (cachedMessage.current) {
              setModalView({ mode: "fullEmail", message: cachedMessage.current });
            }
          }}
          onHandled={onHandled}
          onSummaryReply={() => {
            setModalView({ mode: "summary" });
            handleActionClick("reply");
          }}
          onSummarise={handleSummarise}
        />
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(245,243,240,0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {modalView.mode === "fullEmail" ? (
        <FullEmailView
          message={modalView.message}
          messageCount={messageCount}
          threadLoading={threadLoading}
          onClose={onClose}
          onReply={() => {
            setModalView({ mode: "summary" });
            handleActionClick("reply");
          }}
          onShowThread={handleShowThread}
          onSummarise={handleSummarise}
        />
      ) : threadLoading ? (
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <p className="font-[var(--font-heading)] text-[13px] text-[var(--color-text-muted)]">
            Loading…
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="w-full max-w-xl mx-4"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <SummaryCard
            item={item}
            compose={compose}
            composeText={composeText}
            messageCount={messageCount}
            threadLoading={threadLoading}
            textareaRef={textareaRef}
            onClose={onClose}
            onComposeTextChange={setComposeText}
            onSend={handleSend}
            onDiscard={handleDiscard}
            onActionClick={handleActionClick}
            onShowFullEmail={handleShowFullEmail}
            onShowThread={handleShowThread}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
