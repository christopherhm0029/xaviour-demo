import { NextResponse } from "next/server";
import { threadIntelligence, mockDraftResponses } from "@/lib/mock-data";
import type { ThreadIntelligence } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

/**
 * POST /api/draft
 *
 * Demo route — returns thread-aware, tone-sensitive draft replies
 * using structured mock intelligence. No real AI calls.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const actionLabel = (body.actionLabel || "reply").toLowerCase();
    const userInstruction = (body.userInstruction || "").trim();
    const existingDraft = (body.existingDraft || "").trim();
    const senderName = body.senderName || "them";
    const firstName = senderName.split(" ")[0];

    // Resolve thread from messages or explicit threadId
    const threadId = body.threadId || resolveThreadId(body.threadMessages);
    const intel = threadIntelligence[threadId] || null;

    // Simulate AI drafting delay
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 500));

    let draft: string;

    // ── Revision of existing draft ──────────────────────────────
    if (existingDraft && userInstruction) {
      draft = reviseExistingDraft(existingDraft, userInstruction, firstName, intel);
      return NextResponse.json({ draft, usage: null });
    }

    // ── Forward ─────────────────────────────────────────────────
    if (actionLabel === "forward" || actionLabel.includes("forward")) {
      draft = intel?.forwardNote || mockDraftResponses.forward;
      return NextResponse.json({ draft, usage: null });
    }

    // ── Confirm ─────────────────────────────────────────────────
    if (actionLabel === "confirm" || actionLabel.includes("confirm")) {
      draft = intel?.draftVariants?.short || mockDraftResponses.confirm;
      return NextResponse.json({ draft, usage: null });
    }

    // ── Decline ─────────────────────────────────────────────────
    if (actionLabel === "decline") {
      draft = mockDraftResponses.decline;
      return NextResponse.json({ draft, usage: null });
    }

    // ── Custom instruction (tone-aware) ─────────────────────────
    if (userInstruction) {
      const tone = detectTone(userInstruction);

      if (intel && tone && intel.draftVariants[tone as keyof typeof intel.draftVariants]) {
        draft = intel.draftVariants[tone as keyof typeof intel.draftVariants];
      } else if (intel) {
        draft = intel.draftVariants.warm;
      } else {
        draft = buildInstructionDraft(userInstruction, firstName);
      }
      return NextResponse.json({ draft, usage: null });
    }

    // ── Default reply — thread-aware with warm tone ─────────────
    if (intel) {
      draft = intel.draftVariants.warm;
    } else {
      draft = `Hey ${firstName},\n\n${mockDraftResponses.reply}\n\nBest,\nChristopher`;
    }

    return NextResponse.json({ draft, usage: null });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────

function resolveThreadId(threadMessages?: Array<{ subject?: string }>): string {
  if (!threadMessages?.length) return "";
  const s = (threadMessages[0]?.subject || "").toLowerCase();
  if (s.includes("budget")) return "thread-budget";
  if (s.includes("meeting") || s.includes("meridian")) return "thread-meeting";
  if (s.includes("password") || s.includes("security")) return "thread-security";
  if (s.includes("proposal") || s.includes("partnership")) return "thread-proposal";
  if (s.includes("standup") || s.includes("api migration") || s.includes("blocker")) return "thread-standup";
  if (s.includes("oslo") || s.includes("travel") || s.includes("trip")) return "thread-travel";
  if (s.includes("receipt") || s.includes("payment") || s.includes("invoice")) return "thread-receipt";
  return "";
}

function detectTone(instruction: string): string | null {
  const q = instruction.toLowerCase();
  if (/\b(short|shorter|brief|briefer|concise|terse|quick)\b/.test(q)) return "concise";
  if (/\b(warm|warmer|friendly|friendlier|casual|relaxed|nice)\b/.test(q)) return "warm";
  if (/\b(formal|professional|polished|buttoned|serious)\b/.test(q)) return "formal";
  if (/\b(blunt|direct|straight|no.?nonsense)\b/.test(q)) return "short";
  return null;
}

function reviseExistingDraft(
  existing: string,
  instruction: string,
  firstName: string,
  intel: ThreadIntelligence | null
): string {
  const q = instruction.toLowerCase();

  // Tone shift — swap to a different variant
  const tone = detectTone(instruction);
  if (intel && tone && intel.draftVariants[tone as keyof typeof intel.draftVariants]) {
    return intel.draftVariants[tone as keyof typeof intel.draftVariants];
  }

  // "Make it shorter" — trim to first meaningful sentence + sign-off
  if (/\b(short|shorter|brief|briefer|concise|terse)\b/.test(q)) {
    const lines = existing.split("\n").filter((l) => l.trim());
    if (lines.length > 3) {
      const greeting = lines[0];
      const core = lines.find(
        (l) => l.length > 20 && !l.startsWith("Hey") && !l.startsWith("Hi") && !l.includes("Christopher")
      ) || lines[1];
      return `${greeting}\n\n${core?.trim()}\n\n— Christopher`;
    }
    return existing;
  }

  // "Make it warmer" — add empathetic opener
  if (/\b(warm|warmer|friendly|friendlier|nice)\b/.test(q)) {
    const warmers = [
      `Hey ${firstName},\n\nReally appreciate you handling this — `,
      `Hey ${firstName},\n\nThanks so much for staying on top of this. `,
      `Hey ${firstName},\n\nGreat work pulling this together. `,
    ];
    const warmer = warmers[Math.floor(Math.random() * warmers.length)];
    const body = existing.replace(/^(Hey|Hi|Hello|Dear)\s+\w+[,.]?\s*\n+/i, "");
    return `${warmer}${body.charAt(0).toLowerCase()}${body.slice(1)}`;
  }

  // "Make it more formal"
  if (/\b(formal|professional|polished)\b/.test(q)) {
    return existing
      .replace(/^Hey\b/i, "Dear")
      .replace(/^Hi\b/i, "Dear")
      .replace(/\bCheers\b/i, "Regards")
      .replace(/\bThanks\b/i, "Thank you")
      .replace(/\n— Christopher$/, "\n\nRegards,\nChristopher");
  }

  // "Add" something
  if (/\b(add|include|mention)\b/.test(q)) {
    const addition = instruction.replace(/^(add|include|mention)\s*/i, "").trim();
    const signOffMatch = existing.match(/\n\n(Best|Cheers|Regards|Thanks|—)[,\s]*\n?Christopher$/i);
    if (signOffMatch) {
      const beforeSignOff = existing.slice(0, existing.indexOf(signOffMatch[0]));
      return `${beforeSignOff}\n\n${addition.charAt(0).toUpperCase()}${addition.slice(1)}.\n${signOffMatch[0]}`;
    }
    return `${existing}\n\n${addition.charAt(0).toUpperCase()}${addition.slice(1)}.`;
  }

  // Generic revision — if intel available, swap to warm variant
  if (intel) {
    return intel.draftVariants.warm;
  }

  return `${existing}\n\n(Updated per your note: "${instruction}")`;
}

function buildInstructionDraft(instruction: string, firstName: string): string {
  const cleaned = instruction
    .replace(/^(write|draft|reply|respond|tell them|say)\s*/i, "")
    .replace(/^(that|to say)\s*/i, "")
    .trim();

  if (cleaned.length < 10) {
    return `Hey ${firstName},\n\n${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}.\n\nBest,\nChristopher`;
  }

  return `Hey ${firstName},\n\n${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}\n\nBest,\nChristopher`;
}
