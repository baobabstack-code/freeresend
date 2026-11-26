import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LaunchKitDownloadPage, { type LaunchKitGroup } from "@/components/pages/LaunchKitDownloadPage";
import { launchKit } from "@/config/launch-kit";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Launch Kit Checklist",
  description: `Printable ${site.name} deployment checklist for Brevo or Amazon SES, DNS, webhooks, monitoring, and rollout validation.`,
  robots: {
    index: false,
    follow: false,
  },
};

const groups: LaunchKitGroup[] = [
  {
    title: "1. Preflight",
    items: [
      "Choose the production hostname and confirm HTTPS will terminate before users hit the app.",
      "Create a production PostgreSQL database and test a direct connection from the deployment environment.",
      "Generate strong admin and auth secrets; store them in the platform secret manager, not in the repo.",
      "Choose the sending provider (Brevo or Amazon SES). For SES, confirm the region and account sandbox status; for either, note the expected monthly sending volume.",
      "Decide whether DNS records will be created manually or through the DigitalOcean API integration.",
    ],
  },
  {
    title: "2. DNS and provider",
    items: [
      "Verify the sender domain with your provider (Brevo or Amazon SES) before creating application API keys.",
      "Publish the provider's verification, DKIM, SPF, and DMARC records (Brevo: brevo-code TXT and DKIM; SES: TXT verification and DKIM CNAME records).",
      `Wait for DNS propagation, then use the ${site.name} dashboard to re-check domain verification.`,
      "Send test messages to at least two external inbox providers and confirm the sender authentication headers pass.",
      "Record the exact production sender addresses that applications are allowed to use.",
    ],
  },
  {
    title: "3. Application rollout",
    items: [
      "Run the production build and confirm /api/health returns a healthy response.",
      "Create one production API key per application or environment that will send email.",
      `Update one low-risk application first with RESEND_BASE_URL pointing at ${site.name}.`,
      "Send transactional smoke tests for plain text, HTML, and failure cases before broad rollout.",
      "Keep the prior email provider credentials available until logs show production traffic is stable.",
    ],
  },
  {
    title: "4. Monitoring and rollback",
    items: [
      "Watch send, bounce, complaint, and delivery metrics in Brevo or Amazon SES during the first production hour.",
      `Confirm provider webhook events are reaching ${site.name} and failed deliveries appear in logs.`,
      "Set alerts for elevated bounce or complaint rates before increasing traffic.",
      "Document the rollback variable changes for every application that was migrated.",
      "Rotate any test or leaked API keys after rollout validation is complete.",
    ],
  },
];

export default async function LaunchKitDownloadRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const purchase = typeof params.purchase === "string" ? params.purchase : undefined;

  if (purchase !== "success") {
    redirect(launchKit.productUrl);
  }

  return <LaunchKitDownloadPage groups={groups} />;
}
