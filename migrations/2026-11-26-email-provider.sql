-- Track which email provider (Amazon SES or Brevo) each domain and email uses.
-- Safe to run more than once. Existing rows were all created with SES.

ALTER TABLE domains    ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'ses';
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'ses';

-- Webhooks look emails up by message_id (provider-neutral) or ses_message_id (older rows).
CREATE INDEX IF NOT EXISTS idx_email_logs_ses_message_id ON email_logs(ses_message_id);
