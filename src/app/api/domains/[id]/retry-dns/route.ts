import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import {
  getDomainById,
  refreshDomainDnsRecords,
  syncDnsToDigitalOcean,
} from "@/lib/domains";
import { verifyDomainOwnership } from "@/lib/digitalocean";

function cors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

/**
 * Refresh a domain's DNS records from the email provider, store them,
 * and push them to DigitalOcean when the domain is hosted there.
 * POST /api/domains/:id/retry-dns
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (request.method === "OPTIONS") {
    return cors(new NextResponse(null, { status: 200 }));
  }

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return cors(
        NextResponse.json(
          { error: "Missing or invalid authorization header" },
          { status: 401 }
        )
      );
    }

    const user = verifyJWT(authHeader.substring(7));
    if (!user) {
      return cors(
        NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      );
    }

    const { id } = await params;
    const domain = await getDomainById(id);
    if (!domain || domain.user_id !== user.id) {
      return cors(
        NextResponse.json({ error: "Domain not found" }, { status: 404 })
      );
    }

    const domainName = domain.domain;

    try {
      const dnsRecords = await refreshDomainDnsRecords(domain);

      if (!(await verifyDomainOwnership(domainName))) {
        return cors(
          NextResponse.json(
            {
              success: false,
              error: `Domain ${domainName} not found in your DigitalOcean account. Please add it first.`,
              data: { domain: domainName, dnsRecords },
            },
            { status: 400 }
          )
        );
      }

      const dns = await syncDnsToDigitalOcean(domainName, dnsRecords);

      return cors(
        NextResponse.json({
          success: true,
          data: {
            domain: domainName,
            dnsRecords,
            createdRecords: dns.records,
            setupInstructions: dns.instructions,
          },
          message: `DNS setup completed for ${domainName}. Synced ${dns.records.length} records.`,
        })
      );
    } catch (error: unknown) {
      console.error(`DNS retry failed for ${domainName}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return cors(
        NextResponse.json(
          {
            success: false,
            error: `Failed to refresh DNS records: ${errorMessage}`,
          },
          { status: errorMessage.includes("was set up with") ? 409 : 500 }
        )
      );
    }
  } catch (error) {
    console.error("API Error:", error);
    return cors(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
}
