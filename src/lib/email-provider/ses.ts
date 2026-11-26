import {
  sendEmail,
  verifyDomain,
  getDomainVerificationStatus,
  enableDomainDkim,
  getDomainDkimTokens,
  createConfigurationSet,
  generateDNSRecords,
} from "../ses";
import { createSmtpCredentials, deleteSmtpCredentials } from "../smtp";
import type { DomainStatus, EmailProvider, ProviderDNSRecord } from "./types";

async function dkimTokensFor(domain: string): Promise<string[]> {
  try {
    const tokens = await getDomainDkimTokens(domain);
    if (tokens.length > 0) return tokens;
  } catch {
    // fall through and try to enable DKIM
  }
  try {
    return await enableDomainDkim(domain);
  } catch (error) {
    console.warn(
      `DKIM setup failed for ${domain}:`,
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

export const sesProvider: EmailProvider = {
  name: "ses",
  label: "Amazon SES",
  smtpMode: "per-domain",

  sendEmail,

  async setupDomain(domain, existingToken) {
    let verificationToken = existingToken || undefined;
    if (!verificationToken) {
      verificationToken = (await verifyDomain(domain)).verificationToken;
    } else {
      // Make sure the identity still exists in SES; re-verify if it was removed.
      try {
        await getDomainVerificationStatus(domain);
      } catch {
        verificationToken = (await verifyDomain(domain)).verificationToken;
      }
    }
    const dkimTokens = await dkimTokensFor(domain);
    let configurationSet: string | undefined;
    try {
      configurationSet = await createConfigurationSet(domain);
    } catch (error) {
      console.warn("SES configuration set creation failed:", error);
    }
    return {
      verificationToken,
      configurationSet,
      dnsRecords: generateDNSRecords(domain, verificationToken, dkimTokens),
    };
  },

  async getDnsRecords(domain, verificationToken) {
    const dkimTokens = await dkimTokensFor(domain);
    return generateDNSRecords(domain, verificationToken || "", dkimTokens) as ProviderDNSRecord[];
  },

  async checkDomainStatus(domain): Promise<DomainStatus> {
    const status = await getDomainVerificationStatus(domain);
    if (status === "Success") return "verified";
    if (status === "Failed") return "failed";
    return "pending";
  },

  createSmtpCredentials,
  deleteSmtpCredentials,
};
