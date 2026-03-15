export type Category = "urgent" | "important" | "informative" | "noise";
export type ActionType = "send" | "confirm" | "open" | "dismiss";

export interface BriefAction {
  id: string;
  label: string;
  type: ActionType;
}

export interface EmailBriefItem {
  id: string;
  category: Category;
  sender: { name: string; email: string };
  subject: string;
  rewrittenSubject: string;
  narrative: string;
  draftedReply?: string;
  actions: BriefAction[];
  timeAgo: string;
  threadId?: string;
  messageCount?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  attendeeCount: number;
  minutesUntil: number;
}

export interface BriefData {
  userName: string;
  counts: { urgent: number; important: number; informative: number; noise: number };
  items: EmailBriefItem[];
  silentCount: number;
  silentSample: string[];
  nextEvent?: CalendarEvent;
}

// ── Demo brief data ─────────────────────────────────────────────

export const mockBrief: BriefData = {
  userName: "Christopher",
  counts: { urgent: 2, important: 3, informative: 2, noise: 14 },
  items: [
    {
      id: "e1",
      threadId: "thread-budget",
      category: "urgent",
      sender: { name: "Sarah Chen", email: "sarah@example.com" },
      subject: "Q4 Budget Approval Needed",
      rewrittenSubject: "Q4 budget needs your approval today",
      narrative:
        "needs your approval on the Q4 budget — decision required by EOD.",
      draftedReply:
        "Thanks Sarah. I've reviewed the revised numbers and they look reasonable given our current trajectory. Approved — please proceed with the updated allocation.",
      actions: [
        { id: "a1", label: "↑ send reply", type: "send" },
        { id: "a2", label: "open email", type: "open" },
      ],
      timeAgo: "2m ago",
      messageCount: 3,
    },
    {
      id: "e2",
      threadId: "thread-meeting",
      category: "important",
      sender: { name: "Marcus Williams", email: "marcus@example.com" },
      subject: "Client Meeting Moved to 3 PM Today",
      rewrittenSubject: "Client meeting moved to 3 PM",
      narrative:
        "moved today's client meeting to 3 PM. Your 2:30 slot is now free —",
      actions: [{ id: "a3", label: "yes, confirm", type: "confirm" }],
      timeAgo: "15m ago",
      messageCount: 2,
    },
    {
      id: "e3",
      threadId: "thread-security",
      category: "urgent",
      sender: { name: "IT Security", email: "security@example.com" },
      subject: "Action Required: Password Reset",
      rewrittenSubject: "Password reset requires your action",
      narrative: "flagged a password reset request — link expires in 2 hours.",
      actions: [{ id: "a4", label: "open link", type: "open" }],
      timeAgo: "1h ago",
      messageCount: 1,
    },
    {
      id: "e4",
      threadId: "thread-proposal",
      category: "important",
      sender: { name: "Elena Voss", email: "elena@example.com" },
      subject: "Partnership Proposal — Draft for Review",
      rewrittenSubject: "Partnership draft ready for review",
      narrative:
        "shared a draft partnership proposal and is asking for your feedback before the Friday deadline.",
      draftedReply:
        "Elena, I've gone through the draft. The terms look solid — I have a few minor notes on section 3 that I'll send over by tomorrow morning.",
      actions: [
        { id: "a5", label: "↑ send reply", type: "send" },
        { id: "a6", label: "open email", type: "open" },
      ],
      timeAgo: "45m ago",
      messageCount: 4,
    },
    {
      id: "e5",
      threadId: "thread-standup",
      category: "important",
      sender: { name: "Alex Rivera", email: "alex@example.com" },
      subject: "Standup Notes — Blocker on API Migration",
      rewrittenSubject: "API migration blocker flagged",
      narrative:
        "flagged a blocker on the API migration — needs your input on the auth middleware approach.",
      actions: [
        { id: "a7", label: "↑ reply", type: "send" },
      ],
      timeAgo: "1h ago",
      messageCount: 5,
    },
    {
      id: "e6",
      threadId: "thread-travel",
      category: "informative",
      sender: { name: "TravelBot", email: "bookings@example.com" },
      subject: "Oslo Trip Confirmed — Ref #3275646",
      rewrittenSubject: "Oslo confirmed — ref #3275646",
      narrative:
        "your Oslo trip is confirmed for 22 Mar. Reference #3275646 — hotel and flights are locked in.",
      actions: [{ id: "a8", label: "open details", type: "open" }],
      timeAgo: "3h ago",
      messageCount: 1,
    },
    {
      id: "e7",
      threadId: "thread-receipt",
      category: "informative",
      sender: { name: "Stripe", email: "receipts@example.com" },
      subject: "Payment Receipt — March Invoice",
      rewrittenSubject: "March invoice payment confirmed",
      narrative: "your March invoice payment of €2,400 has been processed.",
      actions: [{ id: "a9", label: "view receipt", type: "open" }],
      timeAgo: "5h ago",
      messageCount: 1,
    },
  ],
  silentCount: 14,
  silentSample: [
    "newsletters",
    "Amazon confirmations",
    "LinkedIn",
    "Coinbase Bytes",
    "Burton Snowboards",
    "Lovable updates",
    "Banorte promo",
  ],
  nextEvent: {
    id: "c1",
    title: "Team standup",
    startTime: "15:00",
    attendeeCount: 3,
    minutesUntil: 38,
  },
};

// ── Demo thread messages (used by mock API routes) ──────────────

export interface DemoThreadMessage {
  id: string;
  threadId: string;
  date: string;
  from: { name: string; email: string };
  subject: string;
  body: string;
}

export const mockThreads: Record<string, DemoThreadMessage[]> = {
  "thread-budget": [
    {
      id: "msg-b1",
      threadId: "thread-budget",
      date: new Date(Date.now() - 2 * 60_000).toISOString(),
      from: { name: "Sarah Chen", email: "sarah@example.com" },
      subject: "Q4 Budget Approval Needed",
      body: "Hi Christopher,\n\nThe finance team has finalised the Q4 budget. We need your sign-off before EOD today so we can lock the allocations ahead of the planning cycle.\n\nKey changes from last quarter:\n- Engineering headcount increased by 2\n- Marketing spend reduced by 12%\n- Infrastructure budget up 8% (cloud costs)\n\nThe full breakdown is attached. Happy to jump on a quick call if anything looks off.\n\nBest,\nSarah",
    },
    {
      id: "msg-b2",
      threadId: "thread-budget",
      date: new Date(Date.now() - 60 * 60_000).toISOString(),
      from: { name: "Christopher", email: "chris@example.com" },
      subject: "Re: Q4 Budget Approval Needed",
      body: "Sarah — thanks for pulling this together. I'll review the numbers this morning and get back to you.",
    },
    {
      id: "msg-b3",
      threadId: "thread-budget",
      date: new Date(Date.now() - 3 * 3600_000).toISOString(),
      from: { name: "Sarah Chen", email: "sarah@example.com" },
      subject: "Q4 Budget Approval Needed",
      body: "Hi Christopher,\n\nHeads up — the Q4 planning cycle kicks off next week. I'm putting together the budget draft and will need your approval before Friday.\n\nI'll send the full breakdown once finance signs off on the numbers.\n\nSarah",
    },
  ],
  "thread-meeting": [
    {
      id: "msg-m1",
      threadId: "thread-meeting",
      date: new Date(Date.now() - 15 * 60_000).toISOString(),
      from: { name: "Marcus Williams", email: "marcus@example.com" },
      subject: "Client Meeting Moved to 3 PM Today",
      body: "Hey Christopher,\n\nQuick update — the Meridian team asked if we could push today's sync to 3 PM. Something came up on their end.\n\nDoes that still work for you? If not, I can suggest tomorrow morning instead.\n\nThanks,\nMarcus",
    },
    {
      id: "msg-m2",
      threadId: "thread-meeting",
      date: new Date(Date.now() - 2 * 3600_000).toISOString(),
      from: { name: "Marcus Williams", email: "marcus@example.com" },
      subject: "Client Meeting — Agenda",
      body: "Christopher,\n\nHere's the agenda for today's Meridian sync:\n\n1. Q3 deliverables review\n2. Roadmap alignment for Q4\n3. Contract renewal timeline\n\nLet me know if you want to add anything.\n\nMarcus",
    },
  ],
  "thread-security": [
    {
      id: "msg-s1",
      threadId: "thread-security",
      date: new Date(Date.now() - 3600_000).toISOString(),
      from: { name: "IT Security", email: "security@example.com" },
      subject: "Action Required: Password Reset",
      body: "Hello,\n\nA password reset was requested for your account. If this was you, please use the link below to set a new password. The link expires in 2 hours.\n\nIf you did not request this, please contact IT Security immediately.\n\nRegards,\nIT Security Team",
    },
  ],
  "thread-proposal": [
    {
      id: "msg-p1",
      threadId: "thread-proposal",
      date: new Date(Date.now() - 45 * 60_000).toISOString(),
      from: { name: "Elena Voss", email: "elena@example.com" },
      subject: "Partnership Proposal — Draft for Review",
      body: "Hi Christopher,\n\nAttached is the latest draft of the partnership proposal. I've incorporated the feedback from our last call.\n\nCould you review sections 2 and 3 in particular? The terms around revenue sharing and exclusivity need your sign-off.\n\nDeadline for the final version is Friday.\n\nThanks,\nElena",
    },
    {
      id: "msg-p2",
      threadId: "thread-proposal",
      date: new Date(Date.now() - 2 * 3600_000).toISOString(),
      from: { name: "Christopher", email: "chris@example.com" },
      subject: "Re: Partnership Proposal — Draft for Review",
      body: "Elena — I had a few concerns about the exclusivity clause. Can we make it non-exclusive for the first 12 months?",
    },
    {
      id: "msg-p3",
      threadId: "thread-proposal",
      date: new Date(Date.now() - 4 * 3600_000).toISOString(),
      from: { name: "Elena Voss", email: "elena@example.com" },
      subject: "Partnership Proposal — Draft for Review",
      body: "Christopher,\n\nGreat call yesterday. I'll update the proposal to reflect our discussion points and send a revised draft later today.\n\nElena",
    },
    {
      id: "msg-p4",
      threadId: "thread-proposal",
      date: new Date(Date.now() - 24 * 3600_000).toISOString(),
      from: { name: "Elena Voss", email: "elena@example.com" },
      subject: "Partnership Proposal — Initial Draft",
      body: "Hi Christopher,\n\nI've put together the first draft of the partnership proposal based on our initial conversations. Take a look when you get a chance.\n\nElena",
    },
  ],
  "thread-standup": [
    {
      id: "msg-st1",
      threadId: "thread-standup",
      date: new Date(Date.now() - 3600_000).toISOString(),
      from: { name: "Alex Rivera", email: "alex@example.com" },
      subject: "Standup Notes — Blocker on API Migration",
      body: "Hey Christopher,\n\nFrom today's standup — we've hit a blocker on the API migration. The new auth middleware isn't compatible with the legacy token format.\n\nOptions:\n1. Write a compatibility shim (2-3 days)\n2. Force-migrate all clients to the new token format (needs your approval)\n3. Run both in parallel until Q1\n\nCan you weigh in on which direction we should go?\n\nAlex",
    },
    {
      id: "msg-st2",
      threadId: "thread-standup",
      date: new Date(Date.now() - 2 * 3600_000).toISOString(),
      from: { name: "Priya Patel", email: "priya@example.com" },
      subject: "Re: Standup Notes — Blocker on API Migration",
      body: "I'd vote for option 2 if we can give clients a 2-week heads up. The shim will just create more tech debt.\n\n— Priya",
    },
    {
      id: "msg-st3",
      threadId: "thread-standup",
      date: new Date(Date.now() - 2.5 * 3600_000).toISOString(),
      from: { name: "Alex Rivera", email: "alex@example.com" },
      subject: "Standup Notes — API Migration Progress",
      body: "Team,\n\nQuick update on the API migration:\n- Auth endpoints: 80% complete\n- Data layer: done\n- Rate limiting: in progress\n\nWe should be on track for the end-of-month target.\n\nAlex",
    },
    {
      id: "msg-st4",
      threadId: "thread-standup",
      date: new Date(Date.now() - 24 * 3600_000).toISOString(),
      from: { name: "Christopher", email: "chris@example.com" },
      subject: "Re: Standup Notes — API Migration Progress",
      body: "Looks good. Let's make sure we have rollback procedures in place before we flip the switch.",
    },
    {
      id: "msg-st5",
      threadId: "thread-standup",
      date: new Date(Date.now() - 48 * 3600_000).toISOString(),
      from: { name: "Alex Rivera", email: "alex@example.com" },
      subject: "API Migration — Kickoff",
      body: "Team,\n\nKicking off the API migration project. Here's the high-level plan:\n\nPhase 1: Auth endpoints (this week)\nPhase 2: Data layer (next week)\nPhase 3: Rate limiting + monitoring\nPhase 4: Client migration + deprecation\n\nLet me know if you have questions.\n\nAlex",
    },
  ],
  "thread-travel": [
    {
      id: "msg-t1",
      threadId: "thread-travel",
      date: new Date(Date.now() - 3 * 3600_000).toISOString(),
      from: { name: "TravelBot", email: "bookings@example.com" },
      subject: "Oslo Trip Confirmed — Ref #3275646",
      body: "Your trip to Oslo has been confirmed.\n\nDetails:\n- Flight: EI 3402, 22 Mar, departing 07:15\n- Hotel: The Thief, Landgangen 1, check-in 15:00\n- Return: EI 3403, 25 Mar, departing 18:30\n\nReference: #3275646\n\nHave a great trip!",
    },
  ],
  "thread-receipt": [
    {
      id: "msg-r1",
      threadId: "thread-receipt",
      date: new Date(Date.now() - 5 * 3600_000).toISOString(),
      from: { name: "Stripe", email: "receipts@example.com" },
      subject: "Payment Receipt — March Invoice",
      body: "Payment confirmed.\n\nAmount: €2,400.00\nDescription: March 2026 — Pro Plan\nCard: •••• 4242\nDate: 15 Mar 2026\n\nThank you for your business.",
    },
  ],
};

// ── Thread intelligence metadata (demo) ─────────────────────────
// Structured knowledge per thread so mock AI can give believable,
// thread-aware responses without any real LLM calls.

export interface ThreadIntelligence {
  threadType: string;
  narrativeSummary: string;
  keyFacts: string[];
  suggestedAction: string;
  draftVariants: {
    short: string;
    warm: string;
    formal: string;
    concise: string;
  };
  forwardNote: string;
  forwardTargets: { name: string; email: string; reason: string }[];
  calendarSuggestions: string[];
  handledMessage: string;
  summaryResponse: string;
  whatIsHappening: string;
}

export const threadIntelligence: Record<string, ThreadIntelligence> = {
  "thread-budget": {
    threadType: "approval",
    narrativeSummary: "Sarah Chen is requesting your sign-off on the Q4 budget. Key changes: engineering headcount +2, marketing −12%, infra +8%. Finance needs approval by EOD to lock allocations before next week's planning cycle.",
    keyFacts: [
      "Q4 budget requires your approval by end of day",
      "Engineering headcount increasing by 2",
      "Marketing spend cut by 12%",
      "Infrastructure budget up 8% due to cloud costs",
      "Planning cycle starts next week",
    ],
    suggestedAction: "Approve the budget with any caveats, or request a quick call to discuss.",
    draftVariants: {
      short: "Sarah — approved. Go ahead with the revised allocations.\n\nBest,\nChristopher",
      warm: "Hey Sarah,\n\nThanks for putting this together so quickly — I know the timeline's been tight. I've reviewed the numbers and everything looks solid. The engineering headcount increase makes sense given our Q4 targets, and the infra adjustment is reasonable.\n\nApproved — please go ahead and lock it in. Let me know if anything else comes up.\n\nCheers,\nChristopher",
      formal: "Hi Sarah,\n\nI have reviewed the Q4 budget proposal and the supporting documentation. The revised allocations are approved.\n\nPlease proceed with locking the budget ahead of the planning cycle. I would appreciate a brief confirmation once the allocations are finalised.\n\nRegards,\nChristopher",
      concise: "Approved. Lock it in.\n\n— Christopher",
    },
    forwardNote: "FYI — the Q4 budget is ready for final sign-off. Key changes from Q3: engineering +2 heads, marketing −12%, infra +8%. See Sarah's breakdown below.",
    forwardTargets: [
      { name: "Marcus Williams", email: "marcus@example.com", reason: "co-approver" },
      { name: "Elena Voss", email: "elena@example.com", reason: "finance stakeholder" },
    ],
    calendarSuggestions: ["Schedule a 15-min budget review call with Sarah this afternoon"],
    handledMessage: "Budget approved — Sarah notified.",
    summaryResponse: "Sarah is asking you to approve the Q4 budget by end of day. The main changes from last quarter are an engineering headcount increase (+2), a 12% cut to marketing, and an 8% bump in infrastructure costs for cloud. The planning cycle starts next week, so this is time-sensitive.",
    whatIsHappening: "This is a budget approval request. Sarah from finance has finalised the Q4 budget and needs your sign-off before EOD so they can lock allocations ahead of next week's planning cycle. You've already acknowledged you'll review it — she's waiting on your decision.",
  },
  "thread-meeting": {
    threadType: "scheduling",
    narrativeSummary: "Marcus Williams is asking to reschedule today's Meridian client sync from 2:30 PM to 3 PM. The client requested the change. Agenda includes Q3 review, Q4 roadmap alignment, and contract renewal timeline.",
    keyFacts: [
      "Meridian client sync moved from 2:30 PM to 3 PM today",
      "Client-initiated reschedule",
      "Agenda: Q3 deliverables, Q4 roadmap, contract renewal",
      "Your 2:30 slot is now free",
      "Alternative: tomorrow morning if 3 PM doesn't work",
    ],
    suggestedAction: "Confirm the 3 PM time works.",
    draftVariants: {
      short: "3 PM works. See you then.\n\n— Christopher",
      warm: "Hey Marcus,\n\n3 PM is perfect — actually gives me a bit more prep time. I'll review the Q3 numbers beforehand so we're ready to go.\n\nSee you there!\nChristopher",
      formal: "Hi Marcus,\n\nThe revised time of 3 PM works for me. I have reviewed the agenda and have no additions at this time.\n\nRegards,\nChristopher",
      concise: "Confirmed for 3 PM.\n\n— Christopher",
    },
    forwardNote: "Heads up — the Meridian sync moved to 3 PM today. Agenda below. Let me know if you want to join.",
    forwardTargets: [
      { name: "Sarah Chen", email: "sarah@example.com", reason: "often joins client calls" },
    ],
    calendarSuggestions: [
      "3:00 PM — Meridian sync (rescheduled)",
      "Your 2:30 slot is now free — use it for budget review?",
    ],
    handledMessage: "Meeting confirmed for 3 PM — Marcus notified.",
    summaryResponse: "Marcus is asking to move today's Meridian client sync from 2:30 to 3 PM — it was the client's request. The agenda covers Q3 deliverables, Q4 roadmap alignment, and the contract renewal timeline. He can also offer tomorrow morning as an alternative.",
    whatIsHappening: "This is a scheduling change. The Meridian client team asked to push your sync meeting from 2:30 PM to 3 PM today. Marcus is checking if the new time works for you. The agenda is already set: Q3 review, Q4 roadmap, and contract renewal.",
  },
  "thread-security": {
    threadType: "alert",
    narrativeSummary: "IT Security flagged a password reset request for your account. The reset link expires in 2 hours. If you didn't initiate it, you should contact IT Security immediately.",
    keyFacts: [
      "Password reset requested for your account",
      "Reset link expires in 2 hours",
      "Contact IT Security if you didn't request this",
    ],
    suggestedAction: "If you requested it, use the link. If not, contact IT Security.",
    draftVariants: {
      short: "Thanks — I did request this. Resetting now.\n\n— Christopher",
      warm: "Hi team,\n\nYes, that was me — I initiated the reset earlier. Thanks for the heads up and for keeping things secure.\n\nBest,\nChristopher",
      formal: "To the IT Security Team,\n\nI can confirm that the password reset request was initiated by me. I will complete the reset process shortly.\n\nThank you for the notification.\n\nRegards,\nChristopher",
      concise: "Confirmed — I requested it. Handling now.\n\n— Christopher",
    },
    forwardNote: "FYI — got a password reset notification. Just confirming it was intentional on my end.",
    forwardTargets: [],
    calendarSuggestions: [],
    handledMessage: "Password reset acknowledged.",
    summaryResponse: "IT Security sent a password reset notification for your account. The link expires in 2 hours. They're asking you to confirm whether you initiated it — if not, it could be a security concern.",
    whatIsHappening: "This is a security alert from IT. Someone (presumably you) requested a password reset on your account. The reset link is time-sensitive — it expires in 2 hours. If you didn't request it, you should flag it with IT Security immediately.",
  },
  "thread-proposal": {
    threadType: "review",
    narrativeSummary: "Elena Voss shared the latest draft of a partnership proposal and needs your feedback — specifically on sections 2 (revenue sharing) and 3 (exclusivity). You previously raised concerns about the exclusivity clause and suggested making it non-exclusive for the first 12 months. Deadline is Friday.",
    keyFacts: [
      "Partnership proposal latest draft ready for review",
      "Focus areas: section 2 (revenue sharing) and section 3 (exclusivity)",
      "You previously requested non-exclusive terms for first 12 months",
      "Elena incorporated feedback from your last call",
      "Final version deadline: Friday",
    ],
    suggestedAction: "Review sections 2 and 3, send feedback by tomorrow.",
    draftVariants: {
      short: "Elena — reviewed the draft. Section 3 looks better now. I'll send detailed notes by tomorrow morning.\n\nBest,\nChristopher",
      warm: "Hey Elena,\n\nJust went through the latest draft — really appreciate you turning this around so quickly. The revenue sharing structure in section 2 looks fair, and I can see you've adjusted the exclusivity language in section 3 based on our discussion.\n\nI have a few small notes I'll write up tonight and send over first thing tomorrow. We should be in good shape for Friday.\n\nThanks,\nChristopher",
      formal: "Hi Elena,\n\nI have reviewed the latest draft of the partnership proposal. The revisions to sections 2 and 3 are noted and appear to address the concerns raised in our previous discussion.\n\nI will provide detailed written feedback by tomorrow morning to ensure we meet the Friday deadline.\n\nRegards,\nChristopher",
      concise: "Draft looks good. Notes on section 3 coming tomorrow AM.\n\n— Christopher",
    },
    forwardNote: "FYI — Elena's latest partnership proposal draft. Pay attention to the exclusivity terms in section 3. Feedback needed by Friday.",
    forwardTargets: [
      { name: "Sarah Chen", email: "sarah@example.com", reason: "legal review" },
      { name: "Alex Rivera", email: "alex@example.com", reason: "technical feasibility" },
    ],
    calendarSuggestions: ["Block 30 min tomorrow morning for proposal review"],
    handledMessage: "Feedback sent to Elena — proposal on track for Friday.",
    summaryResponse: "Elena sent the latest partnership proposal draft and needs your feedback on sections 2 (revenue sharing) and 3 (exclusivity) before Friday. You previously asked for the exclusivity clause to be non-exclusive for the first 12 months — she says she's incorporated your feedback from the last call.",
    whatIsHappening: "This is a document review request. Elena Voss has been iterating on a partnership proposal. The latest draft incorporates feedback from your last call, including your concern about the exclusivity clause. She's asking you to review sections 2 and 3 specifically. The final version is due Friday, so your feedback needs to go out by tomorrow at the latest.",
  },
  "thread-standup": {
    threadType: "decision",
    narrativeSummary: "Alex Rivera hit a blocker on the API migration — the new auth middleware isn't compatible with the legacy token format. He's presenting three options and needs your call. Priya Patel favours option 2 (force-migrate clients with 2-week notice).",
    keyFacts: [
      "API migration blocked by auth middleware incompatibility with legacy tokens",
      "Option 1: Compatibility shim (2-3 days, adds tech debt)",
      "Option 2: Force-migrate all clients to new token format (needs your approval)",
      "Option 3: Run both in parallel until Q1",
      "Priya recommends option 2 with a 2-week client notice",
      "Auth endpoints 80% complete, data layer done, rate limiting in progress",
    ],
    suggestedAction: "Choose an option — Priya and Alex both lean toward option 2.",
    draftVariants: {
      short: "Alex — let's go with option 2. Send clients the 2-week deprecation notice and I'll back the decision if anyone pushes back.\n\nChristopher",
      warm: "Hey Alex,\n\nGood call flagging this early. I agree with Priya — option 2 is the right move. The shim would just pile on debt, and running parallel auth paths sounds like a headache waiting to happen.\n\nLet's give clients a 2-week heads up with clear migration docs. I'll handle any escalations if needed.\n\nKeep up the momentum — the migration's looking solid overall.\n\nChristopher",
      formal: "Hi Alex,\n\nThank you for laying out the options clearly. After considering the trade-offs, I am approving option 2: force-migrate all clients to the new token format.\n\nPlease ensure that:\n1. Clients receive a minimum 2-week advance notice\n2. Migration documentation is prepared and distributed\n3. A rollback procedure remains in place as previously discussed\n\nI will support this decision at the leadership level if needed.\n\nRegards,\nChristopher",
      concise: "Option 2. 2-week notice to clients. I'll back it.\n\n— Christopher",
    },
    forwardNote: "FYI — the API migration hit a blocker on auth token compatibility. Team is leaning toward a forced client migration (option 2). Sharing for visibility.",
    forwardTargets: [
      { name: "Priya Patel", email: "priya@example.com", reason: "team member who voted" },
      { name: "Marcus Williams", email: "marcus@example.com", reason: "may affect client timelines" },
    ],
    calendarSuggestions: ["Schedule 15-min decision call with Alex and Priya"],
    handledMessage: "Decision sent — option 2 approved with 2-week client notice.",
    summaryResponse: "Alex hit a blocker on the API migration: the new auth middleware doesn't work with legacy tokens. He's presenting three options — a compatibility shim (2-3 days), force-migrating all clients (needs your OK), or running both in parallel until Q1. Priya voted for option 2 with a 2-week heads-up to clients. They're waiting on your call.",
    whatIsHappening: "This is a technical decision request. The API migration is ~80% done but the team hit a compatibility issue between the new auth middleware and legacy token formats. Alex laid out three options and the team is leaning toward option 2 (force-migrate clients with notice). They need your approval to proceed because it affects external clients.",
  },
  "thread-travel": {
    threadType: "confirmation",
    narrativeSummary: "Your Oslo trip is confirmed for 22-25 March. Flight EI 3402 departs 07:15 on 22 Mar, returning EI 3403 at 18:30 on 25 Mar. Hotel: The Thief, Landgangen 1, check-in 15:00. Reference #3275646.",
    keyFacts: [
      "Oslo trip: 22-25 March",
      "Outbound: EI 3402, 22 Mar, 07:15",
      "Return: EI 3403, 25 Mar, 18:30",
      "Hotel: The Thief, Landgangen 1",
      "Check-in: 15:00",
      "Reference: #3275646",
    ],
    suggestedAction: "No action needed — trip is confirmed.",
    draftVariants: {
      short: "Got it, thanks.\n\n— Christopher",
      warm: "Thanks for confirming! Looking forward to the trip. The Thief is a great choice.\n\nCheers,\nChristopher",
      formal: "Thank you for the confirmation. I have noted the travel details and reference number.\n\nRegards,\nChristopher",
      concise: "Confirmed, thanks.\n\n— Christopher",
    },
    forwardNote: "FYI — my Oslo trip details for 22-25 Mar in case you need them for scheduling. Reference #3275646.",
    forwardTargets: [
      { name: "Marcus Williams", email: "marcus@example.com", reason: "may need to reschedule meetings" },
    ],
    calendarSuggestions: [
      "Block 22-25 Mar for Oslo trip",
      "Set reminder: 21 Mar pack & prep",
    ],
    handledMessage: "Oslo trip noted — no action needed.",
    summaryResponse: "Your Oslo trip is fully confirmed. You're flying out on EI 3402 on 22 March at 07:15, staying at The Thief hotel (check-in 15:00), and returning on EI 3403 on 25 March at 18:30. Reference number is #3275646. Everything's booked — nothing to action here.",
    whatIsHappening: "This is a travel confirmation from the booking system. All your Oslo trip details are locked in — flights, hotel, dates. There's nothing you need to do unless you want to make changes.",
  },
  "thread-receipt": {
    threadType: "receipt",
    narrativeSummary: "Stripe processed your March invoice payment of €2,400 for the Pro Plan. Card ending in 4242. Transaction date: 15 Mar 2026.",
    keyFacts: [
      "Payment: €2,400.00",
      "Description: March 2026 — Pro Plan",
      "Card: ending in 4242",
      "Date: 15 March 2026",
    ],
    suggestedAction: "No action needed — payment processed.",
    draftVariants: {
      short: "Received, thanks.\n\n— Christopher",
      warm: "Thanks for confirming the payment. All good on our end.\n\nBest,\nChristopher",
      formal: "Thank you for the payment confirmation. The transaction has been noted for our records.\n\nRegards,\nChristopher",
      concise: "Noted.\n\n— Christopher",
    },
    forwardNote: "FYI — March invoice payment of €2,400 has been processed via Stripe. Receipt below for your records.",
    forwardTargets: [
      { name: "Sarah Chen", email: "sarah@example.com", reason: "finance tracking" },
    ],
    calendarSuggestions: [],
    handledMessage: "Payment receipt filed.",
    summaryResponse: "Stripe confirmed your March invoice payment of €2,400 for the Pro Plan. It was charged to the card ending in 4242 on 15 March. This is just a receipt — no action needed.",
    whatIsHappening: "This is an automated payment receipt from Stripe. Your March Pro Plan subscription of €2,400 has been successfully processed. It's purely informational.",
  },
};

// ── Canned AI responses for demo ────────────────────────────────

export const mockDraftResponses: Record<string, string> = {
  reply:
    "Thanks for the update. I've reviewed everything and it looks good — let's go ahead as planned. Let me know if you need anything else from my side.",
  confirm:
    "Confirmed — that works for me. See you then.",
  forward:
    "FYI — forwarding this along for your visibility. Let me know if you have any questions.",
  decline:
    "Thanks for thinking of me, but I'll have to pass on this one. Let's catch up separately though — would love to stay in the loop.",
};

export const mockCommandResponses: Record<string, { response: string; action: Record<string, unknown> | null }> = {
  summarise: {
    response: "This thread is about coordinating next steps. The key decision point is the timeline — they're looking for confirmation by end of week.",
    action: null,
  },
  draft: {
    response: "Drafting a reply for you.",
    action: { type: "draft", instruction: "Write a brief, professional reply" },
  },
  forward: {
    response: "Preparing to forward this thread.",
    action: { type: "forward", instruction: "Write a brief forwarding note", recipientName: "", recipientEmail: "" },
  },
  default: {
    response: "Based on the thread, this seems like a routine coordination email. The sender is looking for your input or confirmation. No urgent deadlines visible beyond what's already noted.",
    action: null,
  },
};

// ── Guided demo prompts ─────────────────────────────────────────
// Suggestion chips for the main page and thread workspace.

export const mainPageSuggestions: string[] = [
  "What needs my attention first?",
  "Catch me up on everything",
  "What's the status of the API migration?",
  "Summarise my urgent messages",
];

export const threadSuggestions: Record<string, string[]> = {
  "thread-budget": [
    "Summarise this thread",
    "Draft an approval",
    "What are the key changes?",
    "Forward to Marcus",
  ],
  "thread-meeting": [
    "What's happening here?",
    "Confirm the new time",
    "What's the agenda?",
    "Suggest times",
  ],
  "thread-security": [
    "What is this about?",
    "Draft a quick reply",
    "What should I do?",
  ],
  "thread-proposal": [
    "Summarise this thread",
    "Draft feedback",
    "What needs my review?",
    "Forward to Sarah",
  ],
  "thread-standup": [
    "Catch me up",
    "What are the options?",
    "Draft a decision",
    "Forward to Marcus",
  ],
  "thread-travel": [
    "Show key details",
    "When do I fly back?",
    "Forward to Marcus",
  ],
  "thread-receipt": [
    "Summarise the payment",
    "Forward to Sarah",
  ],
};

// Default thread suggestions when threadId is unknown
export const defaultThreadSuggestions: string[] = [
  "Summarise this",
  "Draft a reply",
  "What should I do?",
  "Forward this",
];
