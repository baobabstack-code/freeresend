import { query } from "./database";
import { getEmailProvider, getProviderName } from "./email-provider";
import type { ProviderName } from "./email-provider";
import {
  setupDomainDNS,
  verifyDomainOwnership,
  type DODomainRecord,
} from "./digitalocean";
import type { Domain } from "./database";

export interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number;
  description?: string;
}

export interface DomainSetupResult {
  domain: Domain;
  dnsRecords: DNSRecord[];
  sesConfigurationSet?: string;
  digitalOceanRecords?: DNSRecord[];
  setupInstructions: string;
}

// Helper function to safely parse DNS records (handles both string and object)
function safeParseDNSRecords(dnsRecords: unknown): DNSRecord[] {
  if (!dnsRecords) return [];
  if (typeof dnsRecords === "string") {
    try {
      return JSON.parse(dnsRecords);
    } catch {
      return [];
    }
  }
  if (Array.isArray(dnsRecords)) {
    return dnsRecords;
  }
  return [];
}

function convertDORecordToDNSRecord(doRecord: DODomainRecord): DNSRecord {
  return {
    type: doRecord.type,
    name: doRecord.name,
    value: doRecord.data,
    ttl: doRecord.ttl,
  };
}

function withParsedRecords(row: Domain): Domain {
  return { ...row, dns_records: safeParseDNSRecords(row.dns_records) };
}

/** The provider a domain was registered with (rows created before the column existed are SES). */
export function domainProvider(domain: Pick<Domain, "provider">): ProviderName {
  return domain.provider === "brevo" ? "brevo" : "ses";
}

/** Throws when a domain belongs to a different provider than the one configured now. */
export function assertDomainProvider(domain: Domain): void {
  const configured = getProviderName();
  const owner = domainProvider(domain);
  if (owner !== configured) {
    const label = (p: ProviderName) => getEmailProvider(p).label;
    throw new Error(
      `${domain.domain} was set up with ${label(owner)}, but this server now uses ${label(configured)}. ` +
        `Delete the domain and add it again to set it up with ${label(configured)}.`
    );
  }
}

/** Push records to DigitalOcean when the domain is hosted there. Never throws. */
export async function syncDnsToDigitalOcean(
  domainName: string,
  dnsRecords: DNSRecord[]
): Promise<{ records: DNSRecord[]; instructions: string }> {
  try {
    if (!(await verifyDomainOwnership(domainName))) {
      return {
        records: [],
        instructions:
          "Add the DNS records below at your DNS provider, then click Verify.",
      };
    }
    const doRecords = await setupDomainDNS(
      domainName,
      dnsRecords.map((r) => ({ ...r, ttl: r.ttl ?? 300 }))
    );
    return {
      records: doRecords.map(convertDORecordToDNSRecord),
      instructions: "DNS records have been created automatically in DigitalOcean.",
    };
  } catch (error) {
    console.warn("DigitalOcean DNS setup failed:", error);
    return {
      records: [],
      instructions: "Add the DNS records below at your DNS provider, then click Verify.",
    };
  }
}

export async function addDomain(
  userId: string,
  domainName: string
): Promise<DomainSetupResult> {
  if (!isValidDomain(domainName)) {
    throw new Error("Invalid domain format");
  }

  const existing = await getDomainByName(domainName);
  if (existing && existing.user_id !== userId) {
    throw new Error("Domain belongs to another user");
  }
  if (existing) assertDomainProvider(existing);

  const provider = getEmailProvider();

  try {
    const setup = await provider.setupDomain(domainName, existing?.verification_token);
    const dnsRecords: DNSRecord[] = setup.dnsRecords;
    const dns = await syncDnsToDigitalOcean(domainName, dnsRecords);

    const result = existing
      ? await query(
          `UPDATE domains
             SET dns_records = $2,
                 verification_token = COALESCE($3, verification_token),
                 ses_configuration_set = COALESCE($4, ses_configuration_set),
                 updated_at = NOW()
           WHERE id = $1
           RETURNING *`,
          [
            existing.id,
            JSON.stringify(dnsRecords),
            setup.verificationToken ?? null,
            setup.configurationSet ?? null,
          ]
        )
      : await query(
          `INSERT INTO domains (user_id, domain, status, ses_configuration_set, dns_records, verification_token, provider)
           VALUES ($1, $2, 'pending', $3, $4, $5, $6)
           RETURNING *`,
          [
            userId,
            domainName,
            setup.configurationSet ?? null,
            JSON.stringify(dnsRecords),
            setup.verificationToken ?? null,
            provider.name,
          ]
        );

    if (result.rows.length === 0) {
      throw new Error("Failed to save domain record");
    }

    return {
      domain: withParsedRecords(result.rows[0]),
      dnsRecords,
      sesConfigurationSet: setup.configurationSet,
      digitalOceanRecords: dns.records,
      setupInstructions: existing
        ? `Domain already exists. ${dns.instructions}`
        : dns.instructions,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to add domain: ${errorMessage}`);
  }
}

/** Re-read the DNS records from the provider and store them. */
export async function refreshDomainDnsRecords(domain: Domain): Promise<DNSRecord[]> {
  assertDomainProvider(domain);
  const records: DNSRecord[] = await getEmailProvider().getDnsRecords(
    domain.domain,
    domain.verification_token
  );
  await query(
    "UPDATE domains SET dns_records = $2, updated_at = NOW() WHERE id = $1",
    [domain.id, JSON.stringify(records)]
  );
  return records;
}

export async function getUserDomains(userId: string): Promise<Domain[]> {
  try {
    const result = await query(
      `SELECT * FROM domains 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows.map((row) => ({
      ...row,
      dns_records: safeParseDNSRecords(row.dns_records),
    }));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch domains: ${errorMessage}`);
  }
}

export async function getDomainById(domainId: string): Promise<Domain | null> {
  try {
    const result = await query("SELECT * FROM domains WHERE id = $1 LIMIT 1", [
      domainId,
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    const domain = result.rows[0];
    return {
      ...domain,
      dns_records: safeParseDNSRecords(domain.dns_records),
    };
  } catch (error) {
    console.error("Get domain by ID error:", error);
    return null;
  }
}

export async function getDomainByName(
  domainName: string
): Promise<Domain | null> {
  try {
    const result = await query(
      "SELECT * FROM domains WHERE domain = $1 LIMIT 1",
      [domainName]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const domain = result.rows[0];
    return {
      ...domain,
      dns_records: safeParseDNSRecords(domain.dns_records),
    };
  } catch (error) {
    console.error("Get domain by name error:", error);
    return null;
  }
}

export async function updateDomainStatus(
  domainId: string,
  status: Domain["status"]
): Promise<void> {
  try {
    const result = await query("UPDATE domains SET status = $1 WHERE id = $2", [
      status,
      domainId,
    ]);

    if (result.rowCount === 0) {
      throw new Error("Domain not found");
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update domain status: ${errorMessage}`);
  }
}

export async function checkDomainVerification(
  domainId: string
): Promise<Domain["status"]> {
  const domain = await getDomainById(domainId);
  if (!domain) {
    throw new Error("Domain not found");
  }

  assertDomainProvider(domain);

  try {
    const newStatus = await getEmailProvider().checkDomainStatus(domain.domain);

    if (newStatus !== domain.status) {
      await updateDomainStatus(domainId, newStatus);
    }

    return newStatus;
  } catch (error) {
    console.error("Failed to check domain verification:", error);
    return domain.status;
  }
}


export async function deleteDomain(
  domainId: string,
  userId: string
): Promise<void> {
  const domain = await getDomainById(domainId);
  if (!domain || domain.user_id !== userId) {
    throw new Error("Domain not found or unauthorized");
  }

  try {
    // Delete from SES (if needed)
    // await deleteDomainIdentity(domain.domain)

    // Delete API keys associated with this domain
    await query("DELETE FROM api_keys WHERE domain_id = $1", [domainId]);

    // Delete domain record
    const result = await query(
      "DELETE FROM domains WHERE id = $1 AND user_id = $2",
      [domainId, userId]
    );

    if (result.rowCount === 0) {
      throw new Error("Domain not found or unauthorized");
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to delete domain: ${errorMessage}`);
  }
}

export async function refreshAllDomainStatuses(): Promise<void> {
  try {
    const result = await query(
      "SELECT id, domain, status FROM domains WHERE status = 'pending'"
    );

    for (const domain of result.rows) {
      try {
        await checkDomainVerification(domain.id);
        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(
          `Failed to check verification for domain ${domain.domain}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Failed to fetch pending domains:", error);
  }
}

export function isValidDomain(domain: string): boolean {
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain) && domain.length <= 253;
}

export function extractDomainFromEmail(email: string): string {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1] : "";
}

export async function validateEmailDomain(email: string): Promise<boolean> {
  const domain = extractDomainFromEmail(email);
  if (!domain) return false;

  const domainRecord = await getDomainByName(domain);
  return domainRecord?.status === "verified";
}
