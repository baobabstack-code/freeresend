import type { Metadata } from "next";
import LaunchKitPage from "@/components/pages/LaunchKitPage";
import { launchKit } from "@/config/launch-kit";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Launch Kit",
  description: `A practical deployment checklist for launching ${site.name} with Brevo or Amazon SES: DNS authentication, webhooks, monitoring, and rollback steps.`,
  alternates: { canonical: launchKit.canonicalUrl },
  openGraph: {
    title: launchKit.name,
    description: `Deploy ${site.name} with a practical DNS, provider, webhook, monitoring, and rollback checklist.`,
    url: launchKit.canonicalUrl,
    siteName: site.name,
    type: "website",
  },
};

export default function LaunchKitRoute() {
  return <LaunchKitPage />;
}
