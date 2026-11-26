import { NextResponse } from "next/server";
import { getEmailProvider } from "@/lib/email-provider";

export const dynamic = "force-dynamic";

/** Which email provider this server sends through (no secrets). */
export async function GET() {
  const provider = getEmailProvider();
  return NextResponse.json({
    success: true,
    data: { name: provider.name, label: provider.label, smtpMode: provider.smtpMode },
  });
}
