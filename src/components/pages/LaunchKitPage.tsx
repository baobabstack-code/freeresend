"use client";

import { Card, Divider, makeStyles, Title3 } from "@fluentui/react-components";
import {
  ArrowRight16Regular,
  Flow24Regular,
  Open16Regular,
  Server24Regular,
  ShieldCheckmark24Regular,
} from "@fluentui/react-icons";
import { deploymentReview, launchKit, sesProductionGuide } from "@/config/launch-kit";
import { site } from "@/config/site";
import { SiteShell } from "../ui/SiteChrome";
import { AppLink, LinkButton } from "../ui/links";
import { Eyebrow, Section } from "../ui/Layout";
import { CheckList, FeatureCard, Grid, Muted, PageHero, PromoBand } from "./PageBits";

const sections = [
  {
    icon: <Server24Regular />,
    title: "Infrastructure preflight",
    copy: "Confirm the database, secrets, provider account, sending limits, DNS ownership, and deployment target before the first production rollout.",
  },
  {
    icon: <ShieldCheckmark24Regular />,
    title: "Deliverability setup",
    copy: "Work through domain verification, DKIM, SPF, DMARC, bounce handling, webhook wiring, and safe sender-domain testing.",
  },
  {
    icon: <Flow24Regular />,
    title: "Launch and rollback",
    copy: `Use smoke tests, monitoring checks, API-key rotation notes, and rollback steps before pointing production apps at ${site.name}.`,
  },
];

const useStyles = makeStyles({
  card: { display: "flex", flexDirection: "column", gap: "16px", padding: "24px", scrollMarginTop: "80px" },
  head: { display: "flex", flexDirection: "column", gap: "6px" },
  spacer: { marginTop: "32px" },
});

export default function LaunchKitPage() {
  const s = useStyles();
  return (
    <SiteShell>
      <PageHero
        eyebrow={`Optional ${launchKit.price} launch kit`}
        title={`Ship ${site.name} without missing the DNS and provider details.`}
        lead={
          <>
            {site.name} is built on open-source, MIT-licensed code and works with Brevo or Amazon SES. This launch kit
            gives you a practical checklist for the parts that usually slow down production email rollouts:
            authentication records, sending limits, webhook events, smoke tests, and rollback planning.
          </>
        }
        actions={
          <>
            <LinkButton
              href={launchKit.checkoutUrl}
              target="_blank"
              appearance="primary"
              size="large"
              icon={<Open16Regular />}
              iconPosition="after"
            >
              Buy for {launchKit.price}
            </LinkButton>
            <LinkButton href="#included-checklist" size="large" icon={<ArrowRight16Regular />} iconPosition="after">
              See what is included
            </LinkButton>
          </>
        }
        note="Stripe checkout redirects to the printable kit after purchase."
        aside={
          <Card id="included-checklist" className={s.card}>
            <div className={s.head}>
              <Eyebrow>Included checklist</Eyebrow>
              <Title3 as="h2">{launchKit.name}</Title3>
            </div>
            <Divider />
            <CheckList items={launchKit.bullets} />
          </Card>
        }
      />

      <Section>
        <Grid cols={3}>
          {sections.map((section) => (
            <FeatureCard key={section.title} icon={section.icon} title={section.title}>
              <Muted>{section.copy}</Muted>
            </FeatureCard>
          ))}
        </Grid>

        <div className={s.spacer}>
          <PromoBand
            title="Need implementation help instead of a checklist?"
            actions={
              <LinkButton
                href={deploymentReview.checkoutUrl}
                target="_blank"
                appearance="primary"
                icon={<Open16Regular />}
                iconPosition="after"
              >
                Book deployment review
              </LinkButton>
            }
          >
            Start with a narrow {deploymentReview.price} review of your {site.name} deployment plan before committing to
            custom work. Using Amazon SES? Read the free{" "}
            <AppLink href={sesProductionGuide.productUrl} inline>
              SES production readiness guide
            </AppLink>{" "}
            too.
          </PromoBand>
        </div>
      </Section>
    </SiteShell>
  );
}
