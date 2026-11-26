import type { Metadata } from "next";
import EmailDnsChecker from "@/components/EmailDnsChecker";
import { SiteShell } from "@/components/ui/SiteChrome";
import { absoluteUrl, site } from "@/config/site";

const url = absoluteUrl("/tools/email-dns-checker");

export const metadata: Metadata = {
  title: "Email DNS Readiness Checker",
  description: `Check SPF, DMARC, DKIM and MX records before launching a ${site.name} sending domain on Brevo or Amazon SES.`,
  alternates: { canonical: url },
  openGraph: {
    title: "Email DNS Readiness Checker",
    description: "Run a quick public DNS check before moving a sending domain into production on Brevo or Amazon SES.",
    url,
    siteName: site.name,
    type: "website",
  },
};

export default function EmailDnsCheckerPage() {
  return (
    <SiteShell>
      <EmailDnsChecker />
    </SiteShell>
  );
}
