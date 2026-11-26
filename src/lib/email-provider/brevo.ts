import type {
  DomainStatus,
  EmailProvider,
  ProviderDNSRecord,
  SendEmailOptions,
  SmtpCredentials,
} from "./types";

const BREVO_API = "https://api.brevo.com/v3";

/** Webhook events we subscribe to (subscription names, not payload names). */
export const BREVO_WEBHOOK_EVENTS = [
  "delivered",
  "hardBounce",
  "softBounce",
  "spam",
  "blocked",
  "invalid",
  "deferred",
] as const;

export class BrevoApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "BrevoApiError";
  }
}

function apiKey(): string {
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    throw new Error(
      "BREVO_API_KEY is not set. Add your Brevo API key to the environment (EMAIL_PROVIDER=brevo)."
    );
  }
  return key;
}

async function brevoFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BREVO_API}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey(),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  const body = text ? safeJson(text) : null;
  if (!res.ok) {
    const err = (body || {}) as { code?: string; message?: string };
    throw new BrevoApiError(
      `Brevo API ${res.status}: ${err.message || err.code || res.statusText}`,
      res.status,
      err.code
    );
  }
  return body as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/** Parse `Name <addr@x.com>` or `addr@x.com` into Brevo's `{ name?, email }`. */
export function parseAddress(input: string): { email: string; name?: string } {
  const match = input.match(/^\s*"?([^"<]*?)"?\s*<\s*([^>\s]+)\s*>\s*$/);
  if (match) {
    const name = match[1].trim();
    return name ? { name, email: match[2] } : { email: match[2] };
  }
  return { email: input.trim() };
}

export function buildSendPayload(options: SendEmailOptions) {
  const { from, to, cc, bcc, subject, html, text, attachments, replyTo, tags } = options;
  const payload: Record<string, unknown> = {
    sender: parseAddress(from),
    to: to.map(parseAddress),
    subject,
  };
  if (cc?.length) payload.cc = cc.map(parseAddress);
  if (bcc?.length) payload.bcc = bcc.map(parseAddress);
  if (html) payload.htmlContent = html;
  if (text) payload.textContent = text;
  // Brevo accepts a single reply-to address.
  if (replyTo?.length) payload.replyTo = parseAddress(replyTo[0]);
  if (attachments?.length) {
    payload.attachment = attachments.map((a) => ({ name: a.filename, content: a.content }));
  }
  if (tags && Object.keys(tags).length) {
    payload.tags = Object.entries(tags).map(([k, v]) => `${k}:${v}`);
  }
  return payload;
}

interface BrevoDnsRecord {
  host_name?: string;
  type?: string;
  value?: string;
  status?: boolean;
}

interface BrevoDomainConfig {
  domain?: string;
  domain_name?: string;
  verified?: boolean;
  authenticated?: boolean;
  dns_records?: Record<string, BrevoDnsRecord>;
}

const RECORD_LABELS: Record<string, string> = {
  brevo_code: "Brevo domain verification",
  dkim_record: "DKIM signature",
  dmarc_record: "DMARC policy",
};

function fqdn(host: string | undefined, domain: string): string {
  const h = (host || "@").trim().replace(/\.$/, "");
  if (h === "@" || h === "" || h === domain) return domain;
  if (h.endsWith(`.${domain}`)) return h;
  return `${h}.${domain}`;
}

export function mapBrevoDnsRecords(
  domain: string,
  records: Record<string, BrevoDnsRecord> | undefined
): ProviderDNSRecord[] {
  if (!records) return [];
  return Object.entries(records)
    .filter(([, r]) => r && r.type && r.value)
    .map(([key, r]) => ({
      type: String(r.type).toUpperCase(),
      name: fqdn(r.host_name, domain),
      value: String(r.value),
      ttl: 300,
      description:
        (RECORD_LABELS[key] || key.replace(/_/g, " ")) +
        (r.status ? " (found)" : ""),
    }));
}

async function getDomainConfig(domain: string): Promise<BrevoDomainConfig> {
  return brevoFetch<BrevoDomainConfig>(`/senders/domains/${encodeURIComponent(domain)}`);
}

/** Make sure Brevo posts transactional events to our webhook. Best effort. */
export async function ensureBrevoWebhook(): Promise<void> {
  const base = process.env.NEXTAUTH_URL;
  const secret = process.env.BREVO_WEBHOOK_SECRET;
  if (!base || !secret) {
    console.warn("Brevo webhook not registered: NEXTAUTH_URL or BREVO_WEBHOOK_SECRET is not set");
    return;
  }
  const url = `${base.replace(/\/$/, "")}/api/webhooks/brevo?token=${encodeURIComponent(secret)}`;
  try {
    const existing = await brevoFetch<{ webhooks?: Array<{ url?: string }> }>(
      "/webhooks?type=transactional"
    );
    if (existing?.webhooks?.some((w) => w.url === url)) return;
    await brevoFetch("/webhooks", {
      method: "POST",
      body: JSON.stringify({
        url,
        description: "Baobab Mail delivery events",
        type: "transactional",
        events: BREVO_WEBHOOK_EVENTS,
      }),
    });
  } catch (error) {
    console.warn("Brevo webhook registration failed:", error);
  }
}

function sharedSmtp(): SmtpCredentials | null {
  const username = process.env.BREVO_SMTP_LOGIN;
  const password = process.env.BREVO_SMTP_KEY;
  if (!username || !password) return null;
  return { username, password, server: "smtp-relay.brevo.com", port: 587, shared: true };
}

export const brevoProvider: EmailProvider = {
  name: "brevo",
  label: "Brevo",
  smtpMode: "shared",

  async sendEmail(options) {
    const res = await brevoFetch<{ messageId?: string; messageIds?: string[] }>("/smtp/email", {
      method: "POST",
      body: JSON.stringify(buildSendPayload(options)),
    });
    const id = res?.messageId || res?.messageIds?.[0];
    if (!id) throw new Error("Brevo did not return a message ID");
    return id;
  },

  async setupDomain(domain) {
    let records: Record<string, BrevoDnsRecord> | undefined;
    try {
      const created = await brevoFetch<BrevoDomainConfig>("/senders/domains", {
        method: "POST",
        body: JSON.stringify({ name: domain }),
      });
      records = created.dns_records;
    } catch (error) {
      // Already added to this Brevo account: read its current configuration.
      if (!(error instanceof BrevoApiError) || error.status >= 500) throw error;
      records = (await getDomainConfig(domain)).dns_records;
    }
    if (!records) records = (await getDomainConfig(domain)).dns_records;
    void ensureBrevoWebhook();
    return { dnsRecords: mapBrevoDnsRecords(domain, records) };
  },

  async getDnsRecords(domain) {
    return mapBrevoDnsRecords(domain, (await getDomainConfig(domain)).dns_records);
  },

  async checkDomainStatus(domain): Promise<DomainStatus> {
    const config = await getDomainConfig(domain);
    if (config.authenticated) return "verified";
    try {
      await brevoFetch(`/senders/domains/${encodeURIComponent(domain)}/authenticate`, {
        method: "PUT",
      });
      return "verified";
    } catch (error) {
      if (error instanceof BrevoApiError && error.status < 500) return "pending";
      throw error;
    }
  },

  getSharedSmtpCredentials: sharedSmtp,
};
