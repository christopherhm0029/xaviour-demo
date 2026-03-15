import type { EmailBriefItem } from "@/lib/mock-data";

export interface ThreadMessage {
  id: string;
  threadId: string;
  date: string;
  from: { name: string; email: string };
  subject: string;
  body: string;
}

export interface HandledInfo {
  itemId: string;
  action: "replied" | "forwarded";
  recipientName: string;
  recipientEmail?: string;
}

export interface EmailModalProps {
  item: EmailBriefItem;
  autoReply?: boolean;
  onClose: () => void;
  onHandled?: (info: HandledInfo) => void;
}

export type ModalView =
  | { mode: "summary" }
  | { mode: "fullEmail"; message: ThreadMessage }
  | { mode: "thread"; messages: ThreadMessage[] };

export type ComposeState =
  | { mode: "idle" }
  | { mode: "drafting"; actionLabel: string }
  | { mode: "compose"; draft: string; actionLabel: string }
  | { mode: "sending" }
  | { mode: "sent"; recipientName: string };

export interface AssistantHistoryEntry {
  id: string;
  query: string;
  response: string;
  type: "info" | "draft" | "forward" | "status" | "error";
}

export type AgentDraftState =
  | { mode: "idle" }
  | { mode: "drafting" }
  | { mode: "ready"; draft: string }
  | { mode: "revising" }
  | { mode: "sending" }
  | { mode: "sent"; recipientName: string }
  | { mode: "error"; message: string };
