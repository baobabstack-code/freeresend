import type { Metadata } from "next";
import DeploymentReviewThanksPage from "@/components/pages/DeploymentReviewThanksPage";
import { deploymentReview } from "@/config/launch-kit";

export const metadata: Metadata = {
  title: "Deployment Review Received",
  description: `Confirmation page for the ${deploymentReview.name}.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function DeploymentReviewThanksRoute() {
  return <DeploymentReviewThanksPage />;
}
