"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import type { BriefData, EmailBriefItem, Category } from "@/lib/mock-data";
import { NavBar } from "./NavBar";
import { GreetingLine } from "./GreetingLine";
import { BriefParagraph } from "./BriefParagraph";
import { SilentSummary } from "./SilentSummary";
import { EmailModal } from "./EmailModal";
import { XaviourMark } from "./XaviourIcon";
import type { HandledInfo } from "./EmailModal";
import { BottomBar } from "./BottomBar";
import { CommandBar } from "./CommandBar";

interface AmbientBriefProps {
  brief: BriefData;
  syncing?: boolean;
  lastSync?: string | null;
  onSync?: () => void;
  authError?: boolean;
  userEmail?: string | null;
}

export function AmbientBrief({ brief, syncing, lastSync, onSync, authError, userEmail }: AmbientBriefProps) {
  const [modalItem, setModalItem] = useState<EmailBriefItem | null>(null);
  const [modalAutoReply, setModalAutoReply] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | "noise" | null>(null);
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());
  const [handledMap, setHandledMap] = useState<Map<string, HandledInfo>>(new Map());
  const [cmdOpen, setCmdOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiResponseVisible, setAiResponseVisible] = useState(false);

  const handleAction = useCallback((itemId: string) => {
    setActionedIds((prev) => new Set(prev).add(itemId));
  }, []);

  const handleHandled = useCallback((info: HandledInfo) => {
    setHandledMap((prev) => new Map(prev).set(info.itemId, info));
  }, []);

  // ⌘K to open command bar, Esc to close (only when no modal open)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && !modalItem) {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
      if (e.key === "Escape" && !modalItem) {
        setCmdOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalItem]);

  const handleAiResponse = useCallback((text: string) => {
    setAiResponse(text);
    setAiResponseVisible(false);
    requestAnimationFrame(() => setAiResponseVisible(true));
  }, []);


  const filteredItems = activeCategory
    ? brief.items.filter((item) =>
        activeCategory === "noise"
          ? false
          : item.category === activeCategory
      )
    : brief.items;

  // Split into active (unresolved) and handled (replied/forwarded)
  const activeItems = filteredItems.filter((item) => !handledMap.has(item.id));
  const handledItems = filteredItems.filter((item) => handledMap.has(item.id));

  return (
    <main className="gradient-mesh min-h-screen">
      <NavBar
        counts={brief.counts}
        userName={brief.userName}
        userEmail={userEmail || undefined}
        nextEvent={brief.nextEvent}
        activeCategory={activeCategory}
        onCategoryClick={(cat) =>
          setActiveCategory(activeCategory === cat ? null : cat)
        }
        onOverviewClick={() => setActiveCategory(null)}
        syncing={syncing}
        onSync={onSync}
      />
      <div className="flex justify-center px-4 sm:px-6 pt-8 sm:pt-14 pb-40">
        <div className="w-full max-w-[620px]">
          <GreetingLine name={brief.userName} />

          {/* Auth error — re-auth required */}
          {authError && (
            <div className="mb-8">
              <p className="font-[var(--font-body)] text-[15px] text-[var(--color-text-body)] italic leading-relaxed">
                Xaviour needs updated permissions to continue.{" "}
                <a
                  href="/api/auth/google"
                  className="font-[var(--font-heading)] not-italic text-[var(--color-accent-text)] hover:underline transition-all duration-150"
                >
                  Grant access →
                </a>
              </p>
            </div>
          )}

          {/* AI Command Response */}
          {aiResponse && (
            <div
              className="mb-10 transition-opacity duration-[400ms]"
              style={{ opacity: aiResponseVisible ? 1 : 0 }}
            >
              <p>
                <span className="mr-1.5"><XaviourMark size={20} /></span>
                <span className="font-[var(--font-body)] font-normal italic text-[var(--color-text-body)] text-[18px] sm:text-[22px] leading-[1.8] sm:leading-[2.0]">
                  {aiResponse}
                </span>{" "}
                <button
                  onClick={() => setAiResponse(null)}
                  className="inline-flex items-center text-[var(--color-text-muted)] text-[13px] font-[var(--font-heading)] ml-1 cursor-pointer hover:opacity-70 transition-opacity duration-150"
                >
                  ×
                </button>
              </p>
            </div>
          )}

          {/* ── Active items — needs attention ── */}
          <div className="flex flex-col">
            {activeItems.map((item, i) => (
              <div key={item.id}>
                {i > 0 && <div className="brief-divider mx-0" />}
                <BriefParagraph
                  item={item}
                  onEditOpen={(it) => { setModalAutoReply(false); setModalItem(it); }}
                  onReply={(it) => { setModalAutoReply(true); setModalItem(it); }}
                  onAction={handleAction}
                />
              </div>
            ))}
          </div>

          <div className="mt-4" />
          <SilentSummary
            count={brief.silentCount}
            sample={brief.silentSample}
          />

          {/* ── Handled items — replied / forwarded ── */}
          {handledItems.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <XaviourMark size={18} style={{ opacity: 0.7 }} />
                <span
                  className="font-[var(--font-heading)]"
                  style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}
                >
                  Handled
                </span>
                <span
                  className="font-[var(--font-heading)]"
                  style={{ fontSize: "11px", color: "var(--color-text-muted)", opacity: 0.5 }}
                >
                  {handledItems.length}
                </span>
              </div>
              <div className="flex flex-col" style={{ opacity: 0.55 }}>
                {handledItems.map((item, i) => {
                  const info = handledMap.get(item.id);
                  return (
                    <div key={item.id} style={{ position: "relative" }}>
                      {i > 0 && <div className="brief-divider mx-0" />}
                      <span
                        className="font-[var(--font-heading)] text-[10px] font-medium"
                        style={{
                          position: "absolute",
                          top: "14px",
                          right: "0",
                          color: info?.action === "forwarded" ? "var(--color-text-muted)" : "var(--color-accent)",
                          background: info?.action === "forwarded" ? "rgba(10,22,40,0.05)" : "rgba(46,107,230,0.08)",
                          borderRadius: "999px",
                          padding: "2px 10px",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          zIndex: 1,
                        }}
                      >
                        {info?.action === "forwarded" ? `Fwd to ${info.recipientName}` : `Replied to ${info?.recipientName || "them"}`}
                      </span>
                      <BriefParagraph
                        item={item}
                        onEditOpen={(it) => { setModalAutoReply(false); setModalItem(it); }}
                        onReply={(it) => { setModalAutoReply(true); setModalItem(it); }}
                        onAction={handleAction}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <CommandBar
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        onResponse={handleAiResponse}
        emailContext={brief.items.map((i) => ({
          threadId: i.threadId,
          sender: i.sender,
          subject: i.subject || i.rewrittenSubject,
          narrative: i.narrative,
          category: i.category,
        }))}
        userName={brief.userName}
      />
      <BottomBar lastSync={lastSync} />
      <AnimatePresence>
        {modalItem && (
          <EmailModal
            item={modalItem}
            autoReply={modalAutoReply}
            onClose={() => { setModalItem(null); setModalAutoReply(false); }}
            onHandled={handleHandled}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
