import { NextResponse } from "next/server";
import { mockBrief } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

/**
 * POST /api/sync
 *
 * Demo route — returns mock brief data with a simulated delay.
 */
export async function POST() {
  // Simulate network + AI processing delay
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));

  const paragraphs = mockBrief.items.map((item) => ({
    threadId: item.threadId || item.id,
    prose: item.narrative,
    rewrittenSubject: item.rewrittenSubject,
    senderName: item.sender.name,
    senderEmail: item.sender.email,
    subject: item.subject,
    category: item.category,
    messageCount: item.messageCount || 1,
    actionPills: item.actions.map((a) => ({ label: a.label, action: a.type })),
    isTravel: item.id === "e6",
    travelDate: item.id === "e6" ? "2026-03-22" : null,
    isAuthCode: false,
    authCode: null,
  }));

  return NextResponse.json({
    paragraphs,
    suspectSpamLine: null,
    generatedAt: new Date().toISOString(),
    counts: mockBrief.counts,
    silentCount: mockBrief.silentCount,
    silentSample: mockBrief.silentSample,
    usage: null,
  });
}
