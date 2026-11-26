import { query } from "./database";

export type EmailEventStatus =
  | "delivered"
  | "bounced"
  | "complained"
  | "failed";

export interface EmailEvent {
  /** Provider message ID returned when the email was sent. */
  messageId: string;
  /** Raw provider event name, stored in webhook_events.event_type. */
  eventType: string;
  /** New email_logs.status, or null to only record the event. */
  status: EmailEventStatus | null;
  errorMessage?: string | null;
  raw: unknown;
}

/**
 * Record a delivery event: update the matching email_logs row (looked up by
 * message_id, or ses_message_id for rows written before message_id was used)
 * and append a webhook_events row. Returns false when no email matched.
 */
export async function applyEmailEvent(event: EmailEvent): Promise<boolean> {
  const rawJson = JSON.stringify(event.raw);
  try {
    const found = await query(
      `SELECT id FROM email_logs
        WHERE message_id = $1 OR ses_message_id = $1
        LIMIT 1`,
      [event.messageId]
    );

    if (found.rows.length === 0) {
      console.warn(`Email log not found for message ID: ${event.messageId}`);
      await query(
        `INSERT INTO webhook_events (email_log_id, event_type, event_data, processed)
         VALUES ($1, $2, $3, $4)`,
        [null, event.eventType, rawJson, false]
      );
      return false;
    }

    const emailLogId = found.rows[0].id;

    if (event.status) {
      await query(
        `UPDATE email_logs
            SET status = $1, error_message = $2, webhook_data = $3
          WHERE id = $4`,
        [event.status, event.errorMessage ?? null, rawJson, emailLogId]
      );
    }

    await query(
      `INSERT INTO webhook_events (email_log_id, event_type, event_data, processed)
       VALUES ($1, $2, $3, $4)`,
      [emailLogId, event.eventType, rawJson, true]
    );
    return true;
  } catch (error) {
    console.error(`Failed to process ${event.eventType} event:`, error);
    try {
      await query(
        `INSERT INTO webhook_events (email_log_id, event_type, event_data, processed)
         VALUES ($1, $2, $3, $4)`,
        [null, event.eventType, rawJson, false]
      );
    } catch (insertError) {
      console.error("Failed to create webhook event record:", insertError);
    }
    return false;
  }
}
