import { NextResponse } from "next/server";
import { threadIntelligence } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

/**
 * POST /api/send
 *
 * Demo route — simulates sending an email (no real email is sent).
 * Returns thread-aware confirmation messages when available.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.to || !body.subject || !body.body) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Simulate send delay
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 300));

    const threadId = body.threadId || "";
    const intel = threadIntelligence[threadId] || null;

    console.log(`[Demo] Simulated send to: ${body.to} | Subject: ${body.subject}`);

    return NextResponse.json({
      success: true,
      messageId: `demo-${Date.now()}`,
      handledMessage: intel?.handledMessage || null,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
