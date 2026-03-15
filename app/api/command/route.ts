import { NextResponse } from "next/server";
import { threadIntelligence } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

/**
 * POST /api/command
 *
 * Demo route — thread-aware mock intelligence layer.
 * Detects intent from user input and returns contextual responses
 * using structured thread metadata. No real AI calls.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = (body.query || "").trim();
    const q = query.toLowerCase();
    const threadId = body.threadId || body.context?.threadId || "";
    const intel = threadIntelligence[threadId] || null;

    // Simulate processing delay — slightly longer for overview queries to feel more considered
    const isOverviewQuery = !threadId && /\b(should|first|review|priorit|attention|handle|focus|overview|tackle)\b/i.test(q);
    await new Promise((r) => setTimeout(r, isOverviewQuery ? 800 + Math.random() * 500 : 500 + Math.random() * 400));

    // ── Intent detection ──────────────────────────────────────

    // 1. Summarise / explain / what is this
    if (/\b(summar|explain|what('?s| is| are)?\b|tell me about|break\s*(it\s*)?down|overview|tl;?dr)\b/i.test(q)) {
      if (intel) {
        return NextResponse.json({
          response: intel.summaryResponse,
          action: null,
        });
      }
      const emails = body.context?.emails;
      if (emails?.length) {
        const e = emails[0];
        return NextResponse.json({
          response: `${e.sender} is reaching out about "${e.subject}". ${e.narrative || "They're looking for your input."}`,
          action: null,
        });
      }
      return NextResponse.json({
        response: "I don't have enough context to summarise this. Try opening a specific thread first.",
        action: null,
      });
    }

    // 2. "What is happening" / status / context
    if (/\b(what('?s|\s+is)\s+(happening|going\s+on|the\s+(situation|status|deal|story))|catch me up|context|brief me)\b/i.test(q)) {
      if (intel) {
        return NextResponse.json({
          response: intel.whatIsHappening,
          action: null,
        });
      }
      // Main-page catch-up — summarise across all threads
      const emails = body.context?.emails as Array<Record<string, string>> | undefined;
      if (emails?.length) {
        const urgent = emails.filter((e) => e.category === "urgent");
        const important = emails.filter((e) => e.category === "important");
        const parts: string[] = [];
        if (urgent.length > 0) parts.push(`Urgent: ${urgent.map((e) => `${e.sender} ${e.narrative || ""}`).join(". ")}`);
        if (important.length > 0) parts.push(`Important: ${important.map((e) => `${e.sender} ${e.narrative || ""}`).join(". ")}`);
        if (parts.length > 0) {
          return NextResponse.json({
            response: `Here's where things stand:\n\n${parts.join("\n\n")}\n\nPlus ${emails.length - urgent.length - important.length} other items — nothing else needs your attention right now.`,
            action: null,
          });
        }
      }
      return NextResponse.json({
        response: "Open a thread first so I can give you context on what's happening.",
        action: null,
      });
    }

    // 3. Key facts / details
    if (/\b(key\s*(facts|points|details|takeaways)|important\s*(parts|details|points)|bullet|highlights)\b/i.test(q)) {
      if (intel) {
        const bullets = intel.keyFacts.map((f) => `• ${f}`).join("\n");
        return NextResponse.json({
          response: `Key facts:\n${bullets}`,
          action: null,
        });
      }
      return NextResponse.json({
        response: "I need a thread open to pull out key facts for you.",
        action: null,
      });
    }

    // 4. Draft / reply / respond — with tone detection (thread context required)
    if (/\b(draft|reply|respond|write|tell them|say|compose|answer)\b/i.test(q)) {
      if (intel) {
        const tone = detectTone(q);
        const instruction = tone
          ? `Write a ${tone} reply`
          : query;

        return NextResponse.json({
          response: `Drafting a ${tone || "professional"} reply to ${getSenderFirst(body)}…`,
          action: {
            type: "draft",
            instruction,
            tone: tone || "warm",
          },
        });
      }
      // No thread context — fall through to main-page routing below
    }

    // 5. Tone adjustment (when no explicit "draft" keyword — thread context required)
    if (intel && /\b(make\s*(it\s*)?(shorter|longer|warmer|friendlier|colder|more\s+formal|more\s+concise|more\s+casual|briefer)|shorter|warmer|friendlier|more\s+formal|more\s+concise|more\s+casual|tone\s+down|rewrite|rephrase|tweak)\b/i.test(q)) {
      const tone = detectTone(q);
      return NextResponse.json({
        response: `Revising — making it ${tone || "better"}.`,
        action: {
          type: "draft",
          instruction: query,
          tone: tone || "warm",
        },
      });
    }

    // 6. Forward
    if (/\b(forward|fwd|send\s+(this\s+)?to|share\s+(this\s+)?(with|to))\b/i.test(q)) {
      const emailMatch = q.match(/[\w.-]+@[\w.-]+/);
      const nameMatch = q.match(/(?:forward|fwd|send|share)\s+(?:this\s+)?(?:to|with)\s+(\w+)/i);
      const targetName = nameMatch?.[1] || "";

      // Try to resolve from thread intelligence forward targets
      if (intel && targetName && !emailMatch) {
        const match = intel.forwardTargets.find(
          (t) => t.name.toLowerCase().includes(targetName.toLowerCase())
        );
        if (match) {
          return NextResponse.json({
            response: `Preparing to forward to ${match.name} (${match.reason}).`,
            action: {
              type: "forward",
              instruction: "Write a brief forwarding note",
              recipientName: match.name,
              recipientEmail: match.email,
            },
          });
        }
      }

      return NextResponse.json({
        response: emailMatch
          ? "Preparing to forward this thread."
          : targetName
            ? `I couldn't find "${targetName}" in this thread. Try including their email address.`
            : "Who should I forward this to? Try: forward to name@email.com",
        action: emailMatch
          ? {
              type: "forward",
              instruction: "Write a brief forwarding note",
              recipientName: targetName || emailMatch[0].split("@")[0],
              recipientEmail: emailMatch?.[0] || "",
            }
          : null,
      });
    }

    // 7. Scheduling / calendar / availability
    if (/\b(schedule|calendar|availab|free|slot|meet|when|suggest\s*(a?\s*)?(time|slot)|pick\s*a?\s*time|book)\b/i.test(q)) {
      if (intel && intel.calendarSuggestions.length > 0) {
        const suggestions = intel.calendarSuggestions.map((s) => `• ${s}`).join("\n");
        return NextResponse.json({
          response: `Here's what I'd suggest:\n${suggestions}`,
          action: null,
        });
      }
      return NextResponse.json({
        response: "I can see some open slots on your calendar. Would you like me to suggest times?",
        action: null,
      });
    }

    // 8. What should I do / suggest / recommend / review / answer / prioritize / focus
    if (/\b(what\s+should\s+I|suggest|recommend|advice|next\s+step|what\s+do\s+you\s+think|what\s+would\s+you|what.*review|what.*answer|where.*start|what.*respond|what.*handle|what.*tackle|prioriti[sz]e|what\s+matters|focus\s+on|help\s+me|what\s+can\s+wait|what.*less\s+urgent|what.*not\s+urgent|what.*skip|what.*ignore|what.*later)\b/i.test(q)) {
      if (intel) {
        return NextResponse.json({
          response: intel.suggestedAction,
          action: null,
        });
      }
      // Main-page guidance — build editorial recommendation from inbox state
      const emails = body.context?.emails as Array<Record<string, string>> | undefined;
      if (emails?.length) {
        return NextResponse.json({
          response: buildOverviewGuidance(q, emails),
          action: null,
        });
      }
      return NextResponse.json({
        response: "Open a thread so I can give you specific guidance on what to do next.",
        action: null,
      });
    }

    // 9. Send it / approve / confirm
    if (/^(send\s*(it|this)?|yes\s*send|approve|confirm|looks?\s*good|lgtm|ship\s*it|go\s*ahead|do\s*it)(\s*(and\s*)?send)?[.!]?$/i.test(q)) {
      return NextResponse.json({
        response: "Ready to send — hit confirm.",
        action: { type: "send" },
      });
    }

    // ── Default: thread-aware contextual response ──────────────
    if (intel) {
      return NextResponse.json({
        response: intel.narrativeSummary,
        action: null,
      });
    }

    // Thread context exists but no intelligence match — give helpful response
    if (threadId) {
      return NextResponse.json({
        response: `I can help with this thread — try asking me to summarise, draft a reply, or suggest next steps.`,
        action: null,
      });
    }

    // ── Main page routing — no specific thread context ────────
    const emails = body.context?.emails as Array<Record<string, string>> | undefined;

    if (!intel && emails?.length) {
      // "What needs my attention first?" / priority / urgent
      if (/\b(attention|first|priority|urgent|important|critical|what.*need|start\s*with|focus)\b/i.test(q)) {
        return NextResponse.json({
          response: buildOverviewGuidance(q, emails),
          action: null,
        });
      }

      // "Summarise my urgent messages" / "summarize important" / "give me an overview"
      if (/\b(summar|overview|brief)\b/i.test(q) && /\b(urgent|important|all|inbox|messages|everything|today)\b/i.test(q)) {
        return NextResponse.json({
          response: buildOverviewGuidance(q, emails),
          action: null,
        });
      }

      // "Draft a reply to the budget" / "reply to Sarah" — thread-specific from main page
      if (/\b(draft|reply|respond|write)\b/i.test(q)) {
        const match = emails.find((e) => {
          const name = (e.sender || "").toLowerCase();
          const subject = (e.subject || "").toLowerCase();
          return q.includes(name.split(" ")[0].toLowerCase()) ||
                 q.includes(subject.split(" ").slice(0, 3).join(" ").toLowerCase()) ||
                 (q.includes("budget") && subject.includes("budget")) ||
                 (q.includes("meeting") && subject.includes("meeting")) ||
                 (q.includes("proposal") && subject.includes("proposal")) ||
                 (q.includes("migration") && (subject.includes("migration") || subject.includes("standup") || subject.includes("blocker")));
        });
        if (match) {
          const matchIntel = threadIntelligence[match.threadId || ""];
          return NextResponse.json({
            response: matchIntel
              ? `${match.sender} ${matchIntel.narrativeSummary.split(". ")[0]}. Open their thread to draft a reply.`
              : `Open ${match.sender}'s thread to draft a reply.`,
            action: null,
          });
        }
      }

      // "What's the status of the API migration?" — specific thread lookup from main page
      if (/\b(status|update|happening|going\s*on)\b/i.test(q)) {
        const match = emails.find((e) => {
          const subject = (e.subject || "").toLowerCase();
          return (q.includes("api") && (subject.includes("api") || subject.includes("migration") || subject.includes("standup"))) ||
                 (q.includes("budget") && subject.includes("budget")) ||
                 (q.includes("meeting") && subject.includes("meeting")) ||
                 (q.includes("proposal") && subject.includes("proposal")) ||
                 (q.includes("oslo") && subject.includes("oslo"));
        });
        if (match) {
          const matchIntel = threadIntelligence[match.threadId || ""];
          if (matchIntel) {
            return NextResponse.json({
              response: matchIntel.whatIsHappening,
              action: null,
            });
          }
        }
      }

      // Generic main-page fallback — use editorial guidance
      return NextResponse.json({
        response: buildOverviewGuidance(q, emails),
        action: null,
      });
    }

    return NextResponse.json({
      response: "I'm here to help — try asking me to summarise, draft a reply, forward, or suggest next steps on any thread.",
      action: null,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────

function detectTone(q: string): string | null {
  if (/\b(short|shorter|brief|briefer|concise|terse)\b/i.test(q)) return "concise";
  if (/\b(warm|warmer|friendly|friendlier|casual|relaxed)\b/i.test(q)) return "warm";
  if (/\b(formal|professional|polished|buttoned.?up)\b/i.test(q)) return "formal";
  if (/\b(long|longer|detailed|elaborate|thorough)\b/i.test(q)) return "formal";
  return null;
}

function getSenderFirst(body: Record<string, unknown>): string {
  const ctx = body.context as Record<string, unknown> | undefined;
  const emails = ctx?.emails as Array<Record<string, string>> | undefined;
  if (emails?.length) return emails[0].sender?.split(" ")[0] || "them";
  return "them";
}

// ── Overview guidance builder ────────────────────────────────────
// Builds rich, editorial responses from inbox state for main-page queries.
// No real AI — purely structured logic over mock data categories.

function buildOverviewGuidance(q: string, emails: Array<Record<string, string>>): string {
  const urgent = emails.filter((e) => e.category === "urgent");
  const important = emails.filter((e) => e.category === "important");
  const informative = emails.filter((e) => e.category === "informative");
  const rest = emails.filter((e) => e.category !== "urgent" && e.category !== "important");

  // "What can wait?" / "what's less urgent?" — inverse prioritization
  if (/\b(can\s+wait|less\s+urgent|not\s+urgent|skip|ignore|later|low\s+priority|leave|defer)\b/i.test(q)) {
    if (rest.length > 0 && (urgent.length > 0 || important.length > 0)) {
      const waitItems = rest.map((e) => firstName(e.sender)).join(", ");
      const focusName = urgent.length > 0 ? firstName(urgent[0].sender) : firstName(important[0].sender);
      return `${waitItems} can wait — those are informational, no action needed from you right now. Focus on ${focusName} first, then work through the rest when you have a clear window.`;
    }
    if (rest.length > 0) {
      return `Most of your inbox is low-pressure today. ${rest.map((e) => firstName(e.sender)).join(", ")} — all informational. Read them when you have a quiet moment, nothing is time-sensitive.`;
    }
    return `Everything in your inbox today has some weight to it. I wouldn't skip any of these — but ${firstName(urgent[0]?.sender || important[0]?.sender || "")} is the one to start with.`;
  }

  // Main prioritization — urgent + important
  if (urgent.length > 0 && important.length > 0) {
    const templates = [
      () => {
        const u1 = urgent[0];
        const i1 = important[0];
        const i2 = important.length > 1 ? important[1] : null;
        let resp = `Start with ${firstName(u1.sender)} — ${u1.narrative || u1.subject}. That carries a clear deadline and needs your decision today.`;
        resp += ` After that, ${firstName(i1.sender)} — ${describeImportant(i1)}. That's the kind of thing that slows other people down if it sits.`;
        if (i2) {
          resp += ` Then ${firstName(i2.sender)} — ${describeImportant(i2)}, though that one has a bit more runway.`;
        }
        if (rest.length > 0) {
          resp += ` The rest is informational — ${rest.map((e) => firstName(e.sender)).join(", ")} can wait until the first two are handled.`;
        }
        return resp;
      },
      () => {
        const u1 = urgent[0];
        const i1 = important[0];
        let resp = `Your inbox is not equally urgent. ${firstName(u1.sender)} is your first move — ${u1.narrative || u1.subject}.`;
        resp += ` ${firstName(i1.sender)} comes next because ${describeWhyImportant(i1)}.`;
        if (rest.length > 0) {
          resp += ` Everything else can sit in the background for now. I'd close those two before looking at anything else.`;
        }
        return resp;
      },
      () => {
        const u1 = urgent[0];
        const i1 = important[0];
        let resp = `I'd handle this in three moves. First, ${firstName(u1.sender)} — that's time-sensitive and waiting on you.`;
        resp += ` Second, ${firstName(i1.sender)} — ${describeImportant(i1)}.`;
        if (rest.length > 0) {
          resp += ` Third, scan the informational items from ${rest.map((e) => firstName(e.sender)).join(" and ")} when you have a window. No action needed on those.`;
        }
        return resp;
      },
    ];
    return pick(templates)();
  }

  // Only urgent items
  if (urgent.length > 0) {
    const u1 = urgent[0];
    if (urgent.length === 1) {
      return `One item needs your attention right now — ${firstName(u1.sender)} ${u1.narrative || u1.subject}. Handle that first, and the rest of your inbox is clear. ${rest.length > 0 ? `${rest.length} other items are informational and can wait.` : ""}`;
    }
    let resp = `You have ${urgent.length} urgent items. Start with ${firstName(u1.sender)} — ${u1.narrative || u1.subject}.`;
    if (urgent.length > 1) resp += ` Then ${firstName(urgent[1].sender)} — ${urgent[1].narrative || urgent[1].subject}.`;
    if (rest.length > 0) resp += ` The rest is lower priority — handle the urgent items first.`;
    return resp;
  }

  // Only important items, no urgent
  if (important.length > 0) {
    const templates = [
      () => {
        let resp = `Nothing urgent today — that's a good sign. I'd start with ${firstName(important[0].sender)} since ${describeWhyImportant(important[0])}.`;
        if (important.length > 1) resp += ` After that, ${firstName(important[1].sender)} — ${describeImportant(important[1])}.`;
        if (informative.length > 0) resp += ` The rest is context — read through it when you have a calm moment.`;
        return resp;
      },
      () => {
        let resp = `Your inbox is manageable today. ${firstName(important[0].sender)} is the most important — ${describeImportant(important[0])}.`;
        if (important.length > 1) resp += ` ${firstName(important[1].sender)} is also worth checking in on.`;
        resp += ` No hard deadlines pressing right now, so you have some flexibility in how you work through these.`;
        return resp;
      },
    ];
    return pick(templates)();
  }

  // Calm inbox — all informational / noise
  if (emails.length > 0) {
    const templates = [
      `Your inbox is calm today. ${emails.length} items to look through, but nothing requires immediate action. Read through them when you have a quiet moment — no deadlines pressing.`,
      `Light day. You have ${emails.length} items, all informational. No decisions needed right now, no one is waiting on you. Good time to catch up at your own pace.`,
    ];
    return pick(templates);
  }

  return "Your inbox is empty — nothing needs your attention right now.";
}

// ── Guidance helpers ──

function firstName(sender: string): string {
  return (sender || "").split(" ")[0] || "them";
}

function describeImportant(e: Record<string, string>): string {
  if (e.narrative) return e.narrative.replace(/^\w/, (c) => c.toLowerCase());
  if (e.subject) return `regarding ${e.subject.toLowerCase()}`;
  return "needs your input";
}

function describeWhyImportant(e: Record<string, string>): string {
  const subj = (e.subject || "").toLowerCase();
  if (subj.includes("blocker") || subj.includes("migration")) return "it sounds like your input is needed to unblock progress";
  if (subj.includes("proposal") || subj.includes("draft") || subj.includes("review")) return "they're waiting on your feedback before a deadline";
  if (subj.includes("meeting") || subj.includes("schedule")) return "it affects your calendar today";
  if (subj.includes("budget") || subj.includes("approval")) return "it carries a decision deadline";
  if (e.narrative?.includes("deadline") || e.narrative?.includes("EOD") || e.narrative?.includes("expires")) return "there's a time constraint on it";
  return "it's the most important item in your brief right now";
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
