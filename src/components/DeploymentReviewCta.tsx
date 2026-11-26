"use client";

import { Radar20Regular } from "@fluentui/react-icons";
import { deploymentReview } from "@/config/launch-kit";
import { site } from "@/config/site";
import OfferCta from "./pages/OfferCta";

type DeploymentReviewCtaProps = {
  compact?: boolean;
};

export default function DeploymentReviewCta({ compact = false }: DeploymentReviewCtaProps) {
  return (
    <OfferCta
      compact={compact}
      badgeIcon={<Radar20Regular />}
      badge="Deployment review"
      title="Want a second set of eyes before you send production email?"
      description={
        <>
          Buy a {deploymentReview.price} manual review of one {site.name} deployment plan. Stripe collects your
          deployment URL or GitHub issue and your main DNS or provider concern; do not send credentials.
        </>
      }
      bullets={deploymentReview.bullets}
      checkoutUrl={deploymentReview.checkoutUrl}
      buyLabel={`Book review for ${deploymentReview.price}`}
      moreUrl={deploymentReview.productUrl}
      moreLabel="See scope"
    />
  );
}
