import type { EmailEvent, EmailEventStatus } from "../email-events";

/** Shape of a Brevo transactional webhook payload (fields we use). */
export interface BrevoWebhookPayload {
  event?: string;
  email?: string;
  "message-id"?: string;
  reason?: string;
  [key: string]: unknown;
}

const STATUS_BY_EVENT: Record<string, EmailEventStatus> = {
  delivered: "delivered",
  hard_bounce: "bounced",
  soft_bounce: "bounced",
  spam: "complained",
  blocked: "failed",
  invalid_email: "failed",
  error: "failed",
};

/** Turn a Brevo webhook payload into an EmailEvent, or null if it can't be matched to an email. */
export function mapBrevoEvent(payload: BrevoWebhookPayload): EmailEvent | null {
  const messageId = payload["message-id"];
  const eventType = payload.event;
  if (!messageId || !eventType) return null;

  const status = STATUS_BY_EVENT[eventType] ?? null;
  let errorMessage: string | null = null;
  if (status === "bounced" || status === "failed") {
    errorMessage = [payload.email, payload.reason || eventType.replace(/_/g, " ")]
      .filter(Boolean)
      .join(": ");
  } else if (status === "complained") {
    errorMessage = `Marked as spam by: ${payload.email ?? "recipient"}`;
  }

  return { messageId, eventType, status, errorMessage, raw: payload };
}

/** Constant-time comparison so the token can't be guessed by timing. */
export function tokensMatch(given: string | null, expected: string | undefined): boolean {
  if (!given || !expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
