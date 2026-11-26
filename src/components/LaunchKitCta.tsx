"use client";

import { ClipboardTaskListLtr20Regular } from "@fluentui/react-icons";
import { launchKit } from "@/config/launch-kit";
import { site } from "@/config/site";
import OfferCta from "./pages/OfferCta";

type LaunchKitCtaProps = {
  compact?: boolean;
};

export default function LaunchKitCta({ compact = false }: LaunchKitCtaProps) {
  return (
    <OfferCta
      compact={compact}
      badgeIcon={<ClipboardTaskListLtr20Regular />}
      badge="Optional launch kit"
      title={`Launch ${site.name} with fewer missed setup steps.`}
      description={
        <>
          {site.name} stays open source. The {launchKit.price} launch kit is an optional checklist for teams that want
          a tighter DNS, provider, webhook and production rollout path.
        </>
      }
      bullets={launchKit.bullets}
      checkoutUrl={launchKit.checkoutUrl}
      buyLabel={`Buy for ${launchKit.price}`}
      moreUrl={launchKit.productUrl}
      moreLabel="Preview kit"
    />
  );
}
