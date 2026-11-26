import type { Metadata } from "next";
import SesProductionRequestHelper from "@/components/SesProductionRequestHelper";
import { SiteShell } from "@/components/ui/SiteChrome";
import { sesRequestHelper } from "@/config/launch-kit";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "SES Production Request Helper",
  description: `Draft a safe Amazon SES production access request for a ${site.name} launch without sharing secrets or customer data.`,
  alternates: {
    canonical: sesRequestHelper.canonicalUrl,
  },
  openGraph: {
    title: "SES Production Request Helper",
    description: "Generate a reviewer-friendly Amazon SES production access request from public rollout details.",
    url: sesRequestHelper.canonicalUrl,
    siteName: site.name,
    type: "website",
  },
};

export default function SesProductionRequestHelperPage() {
  return (
    <SiteShell>
      <SesProductionRequestHelper />
    </SiteShell>
  );
}
