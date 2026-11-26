import type { Metadata } from "next";
import PricingPageBody from "@/components/PricingPageBody";
import DeploymentReviewCta from "@/components/DeploymentReviewCta";
import LaunchKitCta from "@/components/LaunchKitCta";
import { SiteShell } from "@/components/ui/SiteChrome";
import { absoluteUrl, site } from "@/config/site";

const title = "Pricing calculator";
const description = `Compare Resend with ${site.name} for your email volume. See what you would pay sending through Brevo's free plan or Amazon SES, including hosting and upkeep.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/pricing") },
  openGraph: {
    title: `${title} | ${site.name}`,
    description,
    url: absoluteUrl("/pricing"),
    siteName: site.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${site.name}`,
    description,
  },
};

export default function PricingPage() {
  return (
    <SiteShell>
      <PricingPageBody
        ctas={
          <>
            <LaunchKitCta />
            <DeploymentReviewCta />
          </>
        }
      />
    </SiteShell>
  );
}
