import type { Metadata } from "next";
import SesProductionGuidePage from "@/components/pages/SesProductionGuidePage";
import { sesProductionGuide } from "@/config/launch-kit";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "SES Production Readiness Guide",
  description: `A practical Amazon SES, DNS, webhook, monitoring, and rollback checklist for teams preparing a ${site.name} deployment for production email.`,
  alternates: {
    canonical: sesProductionGuide.canonicalUrl,
  },
  openGraph: {
    title: `${site.name} SES Production Readiness Guide`,
    description:
      "Check SES sandbox status, DNS authentication, bounce handling, webhooks, and launch risk before sending production email.",
    url: sesProductionGuide.canonicalUrl,
    siteName: site.name,
    type: "article",
  },
};

export default function SesProductionReadinessPage() {
  return <SesProductionGuidePage />;
}
