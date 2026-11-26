import type { SendEmailOptions } from "../ses";

export type { SendEmailOptions, EmailAttachment } from "../ses";

export type ProviderName = "ses" | "brevo";

export type DomainStatus = "pending" | "verified" | "failed";

/** DNS record shape stored in domains.dns_records and shown in the dashboard. */
export interface ProviderDNSRecord {
  type: string;
  /** Fully qualified host name, e.g. "mail._domainkey.example.com" */
  name: string;
  value: string;
  ttl: number;
  description?: string;
}

export interface DomainSetup {
  dnsRecords: ProviderDNSRecord[];
  verificationToken?: string;
  configurationSet?: string;
}

export interface SmtpCredentials {
  username: string;
  password: string;
  server: string;
  port: number;
  domain?: string;
  /** True when the credentials are account-wide (shared by every domain). */
  shared?: boolean;
}

export interface EmailProvider {
  name: ProviderName;
  /** Human-readable name for the UI, e.g. "Amazon SES". */
  label: string;
  sendEmail(options: SendEmailOptions): Promise<string>;
  /** Register (or re-register) a sending domain and return the DNS records to publish. */
  setupDomain(domain: string, existingToken?: string | null): Promise<DomainSetup>;
  /** Fetch the current DNS records for a domain already registered with the provider. */
  getDnsRecords(domain: string, verificationToken?: string | null): Promise<ProviderDNSRecord[]>;
  checkDomainStatus(domain: string): Promise<DomainStatus>;
  /**
   * "per-domain": create/delete credentials per domain (SES/IAM).
   * "shared": one account-wide login read from env (Brevo).
   */
  smtpMode: "per-domain" | "shared";
  createSmtpCredentials?(domain: string): Promise<SmtpCredentials>;
  deleteSmtpCredentials?(domain: string): Promise<void>;
  getSharedSmtpCredentials?(): SmtpCredentials | null;
}
