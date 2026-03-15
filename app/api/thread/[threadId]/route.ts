import { NextResponse } from "next/server";
import { mockThreads } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/thread/[threadId]
 *
 * Demo route — returns mock thread messages for the given threadId.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;

  // Simulate fetch delay
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

  const messages = mockThreads[threadId];

  if (!messages) {
    // Return a generic single-message thread for unknown IDs
    return NextResponse.json({
      threadId,
      messages: [
        {
          id: `demo-msg-${threadId}`,
          threadId,
          date: new Date().toISOString(),
          from: { name: "Demo Sender", email: "demo@example.com" },
          subject: "Demo Email",
          body: "This is a demo email message. In the full Xaviour experience, this would show the real email content from your inbox.",
        },
      ],
    });
  }

  return NextResponse.json({ threadId, messages });
}
