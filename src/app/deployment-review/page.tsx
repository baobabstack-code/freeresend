import type { Metadata } from "next";
import DeploymentReviewPage from "@/components/pages/DeploymentReviewPage";
import { deploymentReview } from "@/config/launch-kit";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Deployment Review",
  description: `A concise manual review of one ${site.name} deployment plan covering DNS, Brevo or Amazon SES setup, webhooks, and launch risk.`,
  alternates: { canonical: deploymentReview.canonicalUrl },
  openGraph: {
    title: deploymentReview.name,
    description: `Get a narrow ${site.name} deployment review before sending production email.`,
    url: deploymentReview.canonicalUrl,
    siteName: site.name,
    type: "website",
  },
};

export default function DeploymentReviewRoute() {
  return <DeploymentReviewPage />;
}
