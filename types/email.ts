/**
 * Xaviour — Email types shared across the application.
 */

/** Xaviour categories */
export type Category = "urgent" | "important" | "informative" | "noise" | "travel";

export interface EmailSender {
  name: string;
  email: string;
}

export interface RawMessage {
  id: string;
  threadId: string;
  snippet: string;
  date: string;
  from: EmailSender;
  subject: string;
  labels: string[];
  body?: string;
}

export interface RawThread {
  id: string;
  subject: string;
  sender: EmailSender;
  snippet: string;
  date: string;
  labels: string[];
  messageCount: number;
  messages: RawMessage[];
}

export interface ClassificationMeta {
  isAuthCode?: boolean;
  code?: string | null;
  isTravel?: boolean;
  travelDate?: string | null;
}

export interface ClassifiedThread extends RawThread {
  category: Category;
  actionRequired: boolean;
  reasoning: string;
  confidence: number;
  meta?: ClassificationMeta;
  narrative?: string;
  draftReply?: string;
}
