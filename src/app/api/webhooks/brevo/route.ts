import { NextRequest, NextResponse } from "next/server";
import { applyEmailEvent } from "@/lib/email-events";
import {
  mapBrevoEvent,
  tokensMatch,
  type BrevoWebhookPayload,
} from "@/lib/email-provider/brevo-events";

export const dynamic = "force-dynamic";

/**
 * Brevo transactional webhook.
 * Registered as /api/webhooks/brevo?token=<BREVO_WEBHOOK_SECRET>.
 * Accepts a single event or a batched array of events.
 */
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!tokensMatch(token, process.env.BREVO_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payloads = (Array.isArray(body) ? body : [body]) as BrevoWebhookPayload[];
  let processed = 0;
  let ignored = 0;

  for (const payload of payloads) {
    const event = mapBrevoEvent(payload);
    if (!event) {
      ignored++;
      continue;
    }
    if (await applyEmailEvent(event)) processed++;
    else ignored++;
  }

  // Always 200 for authenticated calls so Brevo doesn't retry unmatched events forever.
  return NextResponse.json({ processed, ignored });
}
