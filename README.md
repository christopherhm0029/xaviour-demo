# Xaviour AI — UI Demo

> Email, rewritten. Not a client. An operator.

This repository contains the **public UI demo** of Xaviour AI — a narrative-first email experience where AI reads, decides, writes, and you confirm.

**[xaviour.ai](https://xaviour.ai)** — Learn more and join the waiting list
**[demo.xaviour.ai](https://demo.xaviour.ai)** — Try the live demo

> **Demo Notice** — This repository showcases the Xaviour AI experience and interface only. The AI intelligence, proprietary prompts, real integrations (Gmail, Calendar, OAuth), and production backend are **not included**. All responses are simulated using mock logic to demonstrate how the product feels and flows — not how it thinks. The real Xaviour AI is significantly more capable than what you see here.

---

## What this repo is

A working demo of the Xaviour AI UI interactions — the Ambient Brief, thread workspace, AI composer, and command bar.

This demo runs with **simulated data**. No Gmail connection. No live AI calls.

### The Morning Brief

Your inbox distilled into a calm, narrative overview — no list of subjects, no clutter. Xaviour AI tells you what matters and why.

![Morning Brief — narrative inbox overview](docs/screenshots/01-morning-brief.png)

### AI Composer

Ask Xaviour AI anything. The command bar responds with rich, editorial guidance — prioritizing your inbox and telling you exactly where to start.

<p>
  <img src="docs/screenshots/03-command-bar.png" alt="Command bar with full inbox context" width="49%" />
  <img src="docs/screenshots/02-ai-guidance.png" alt="AI narrative guidance response" width="49%" />
</p>

### Thread Workspace

Open any thread to enter a focused workspace. Xaviour AI reads the full conversation and gives you a narrative summary — no skimming required. Hover over message cards to preview individual exchanges.

<p>
  <img src="docs/screenshots/04-thread-workspace.png" alt="Thread workspace with AI summary" width="49%" />
  <img src="docs/screenshots/05-thread-cards.png" alt="Thread cards with hover preview" width="49%" />
</p>

### AI-Drafted Replies

One click and Xaviour AI drafts a contextual reply in your voice. Review, edit, or send — with full thread awareness.

<p>
  <img src="docs/screenshots/08-ai-draft.png" alt="AI-generated draft reply" width="49%" />
  <img src="docs/screenshots/09-draft-confirm.png" alt="Draft ready to confirm and send" width="49%" />
</p>

### Smart Context — Calendar & Scheduling

Xaviour AI surfaces availability and scheduling context alongside the conversation, so you never have to leave the thread to check your calendar.

<p>
  <img src="docs/screenshots/06-thread-ai-summary.png" alt="Thread AI narrative summary" width="49%" />
  <img src="docs/screenshots/07-calendar-widget.png" alt="Calendar availability widget" width="49%" />
</p>

---

## What the real product does

- Connects to your Gmail via OAuth
- AI classifier reads and categorises every email (Claude Haiku)
- Generates a calm narrative brief of what matters (Claude Sonnet)
- Drafts replies in your voice before you open the app
- You confirm — nothing more

---

## Try the demo

[demo.xaviour.ai](https://demo.xaviour.ai)
*(desktop recommended — mobile app in development)*

## Get early access

The real AI-powered product is invite-only.

[Join the waitlist at xaviour.ai](https://xaviour.ai)

Private preview opens before **April 15th, 2026.**

---

## Open Source

This demo repository is **open source** under the AGPLv3 license — you're free to explore, learn from, and build on the UI and interaction patterns.

However, the **full AI configuration, pipeline, prompts, and backend brain** that power the real Xaviour AI experience are **proprietary** and not included in this repository. To experience the full AI-powered product, you'll need to [join the waiting list](https://xaviour.ai).

---

## Built with

- Next.js 15 · Tailwind CSS · TypeScript
- Claude AI by Anthropic (Haiku + Sonnet)
- AWS Bedrock · App Runner · Route 53
- Gmail API (OAuth2)

## Local Development

### Requirements

- Node.js 18+ or newer
- npm

### Run locally

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## License

This repository is licensed under **AGPLv3**.

See the `LICENSE` file for details.

Xaviour AI Demo is open source under AGPLv3. For commercial licensing contact christopher@xaviour.ai.

## Commercial Licensing

For commercial licensing, private deployment, OEM/white-label use, or proprietary usage, contact:

**christopher@xaviour.ai**

See `COMMERCIAL_LICENSE.md` for more information.

## Security

If you discover a security issue, please report it privately to:

**christopher@xaviour.ai**

See `SECURITY.md` for the disclosure policy.

## Disclaimer

This repository is a **UI and experience demo only**. It does not contain the AI models, proprietary prompts, orchestration logic, or production integrations that power the real Xaviour AI product. All AI responses, drafts, and suggestions shown here are generated from mock templates — they demonstrate the workflow, not the intelligence. The production version of Xaviour is significantly more capable and is not represented by this codebase.

---

*Top-1,000 semi-finalist — AWS 10,000 AIdeas Competition*
