"use client";

import { useState, useEffect, useCallback } from "react";
import { mockBrief } from "@/lib/mock-data";
import type { BriefData } from "@/lib/mock-data";
import { AmbientBrief } from "@/components/brief/AmbientBrief";
import { XaviourMark } from "@/components/brief/XaviourIcon";

/** Map API response → BriefData shape the UI expects */
function mapApiResponse(data: Record<string, unknown>): BriefData {
  const counts = (data.counts || {}) as Record<string, number>;
  const paragraphs = (data.paragraphs || []) as Array<Record<string, unknown>>;

  const items = paragraphs.map((p, i) => {
    const pills = (p.actionPills || []) as Array<Record<string, string>>;

    return {
      id: String(p.threadId || `p-${i}`),
      category: mapCategory(String(p.category || "informative")),
      sender: {
        name: String(p.senderName || ""),
        email: String(p.senderEmail || ""),
      },
      subject: String(p.subject || ""),
      rewrittenSubject: String(p.rewrittenSubject || ""),
      narrative: String(p.prose || ""),
      actions: pills.map((pill, j) => ({
        id: `${p.threadId}-a${j}`,
        label: pill.label || "",
        type: mapActionType(pill.action || "open"),
      })),
      timeAgo: "",
      threadId: String(p.threadId || ""),
      messageCount: typeof p.messageCount === "number" ? p.messageCount : undefined,
    };
  });

  return {
    userName: process.env.NEXT_PUBLIC_USER_NAME || "Christopher",
    counts: {
      urgent: counts.urgent || 0,
      important: counts.important || 0,
      informative: (counts.informative || 0) + (counts.travel || 0),
      noise: counts.noise || 0,
    },
    items,
    silentCount: (data.silentCount as number) || 0,
    silentSample: (data.silentSample as string[]) || [],
  };
}

function mapCategory(cat: string): "urgent" | "important" | "informative" | "noise" {
  if (cat === "urgent") return "urgent";
  if (cat === "important") return "important";
  if (cat === "noise") return "noise";
  return "informative";
}

function mapActionType(action: string): "send" | "confirm" | "open" | "dismiss" {
  if (action === "send" || action === "reply") return "send";
  if (action === "confirm") return "confirm";
  if (action === "dismiss") return "dismiss";
  return "open";
}

export default function Home() {
  const [brief, setBrief] = useState<BriefData>(mockBrief);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Fetch authenticated email on mount
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUserEmail(d.email)).catch(() => {});
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    setError(null);

    try {
      const res = await fetch("/api/sync", { method: "POST" });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Sync failed (${res.status})`);
      }

      const data = await res.json();
      const mapped = mapApiResponse(data);
      // Preserve nextEvent across syncs — only update email brief data
      setBrief((prev) => ({ ...mapped, nextEvent: prev.nextEvent }));
      setLastSync("just now");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      setError(msg);
      console.error("Sync error:", msg);
    } finally {
      setSyncing(false);
    }
  }, []);

  // Auto-sync on mount
  useEffect(() => {
    sync();
  }, [sync]);

  // Fade "just now" to timestamp after 60s
  useEffect(() => {
    if (!lastSync) return;
    const timer = setTimeout(() => {
      setLastSync(new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }));
    }, 60_000);
    return () => clearTimeout(timer);
  }, [lastSync]);

  return (
    <>
      {/* Syncing overlay — subtle pulse */}
      {syncing && (
        <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center">
          <div className="animate-pulse font-[var(--font-heading)] text-[13px] text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-5 py-2 shadow-lg pointer-events-none">
            <XaviourMark size={18} animate="thinking" /> Syncing your inbox...
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && !syncing && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] font-[var(--font-heading)] text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-full px-5 py-2 shadow-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-400 hover:text-red-600 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      <AmbientBrief
        brief={brief}
        syncing={syncing}
        lastSync={lastSync}
        onSync={sync}
        authError={error === "reauth_required"}
        userEmail={userEmail}
      />
    </>
  );
}
