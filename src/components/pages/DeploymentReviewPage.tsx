"use client";

import {
  Card,
  Divider,
  makeStyles,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Title3,
} from "@fluentui/react-components";
import {
  MailCheckmark20Regular,
  MailCheckmark24Regular,
  Open16Regular,
  Pulse24Regular,
  ShieldCheckmark24Regular,
} from "@fluentui/react-icons";
import { deploymentReview } from "@/config/launch-kit";
import { site } from "@/config/site";
import { SiteShell } from "../ui/SiteChrome";
import { LinkButton } from "../ui/links";
import { Eyebrow, Section } from "../ui/Layout";
import { CheckList, FeatureCard, Grid, Muted, PageHero } from "./PageBits";

const reviewAreas = [
  {
    icon: <ShieldCheckmark24Regular />,
    title: "DNS authentication",
    copy: "DKIM, SPF, DMARC, sender domains, and the common record-shape mistakes that hurt deliverability.",
  },
  {
    icon: <MailCheckmark24Regular />,
    title: "Provider readiness",
    copy: "For Amazon SES: sandbox status and region choice. For Brevo or SES: suppression handling, bounce events, complaint events, and safe test sending.",
  },
  {
    icon: <Pulse24Regular />,
    title: "Launch risk",
    copy: "Webhook gaps, smoke-test coverage, rollback steps, and the highest-priority fixes before production traffic.",
  },
];

const useStyles = makeStyles({
  card: { display: "flex", flexDirection: "column", gap: "16px", padding: "24px" },
  head: { display: "flex", flexDirection: "column", gap: "6px" },
  spacer: { marginTop: "32px" },
});

export default function DeploymentReviewPage() {
  const s = useStyles();
  return (
    <SiteShell>
      <PageHero
        eyebrow={`${deploymentReview.price} manual deployment review`}
        title="Catch the DNS and provider mistakes before customers see them."
        lead={
          <>
            Send one {site.name} deployment URL, GitHub issue, or rollout note through Stripe checkout. You get a concise
            review focused on email-authentication risk, Brevo or Amazon SES readiness, webhook coverage, and the next
            fixes to make.
          </>
        }
        actions={
          <>
            <LinkButton
              href={deploymentReview.checkoutUrl}
              target="_blank"
              appearance="primary"
              size="large"
              icon={<Open16Regular />}
              iconPosition="after"
            >
              Book review for {deploymentReview.price}
            </LinkButton>
            <LinkButton href="/tools/email-dns-checker" size="large" icon={<MailCheckmark20Regular />}>
              Run DNS check
            </LinkButton>
          </>
        }
        note="Stripe checkout asks for a deployment URL or GitHub issue and your main concern. Do not include API keys, AWS keys, SMTP passwords, database credentials, or other secrets."
        aside={
          <Card className={s.card}>
            <div className={s.head}>
              <Eyebrow>Included</Eyebrow>
              <Title3 as="h2">{deploymentReview.name}</Title3>
            </div>
            <Divider />
            <CheckList items={deploymentReview.bullets} />
          </Card>
        }
      />

      <Section id="scope">
        <Grid cols={3}>
          {reviewAreas.map((area) => (
            <FeatureCard key={area.title} icon={area.icon} title={area.title}>
              <Muted>{area.copy}</Muted>
            </FeatureCard>
          ))}
        </Grid>

        <div className={s.spacer}>
          <MessageBar intent="warning" layout="multiline">
            <MessageBarBody>
              <MessageBarTitle>Narrow by design</MessageBarTitle>
              This is a one-page review of one deployment plan, not a full implementation contract, live debugging
              session, or deliverability guarantee. For custom development, use the professional support path after the
              review identifies the concrete work.
            </MessageBarBody>
          </MessageBar>
        </div>
      </Section>
    </SiteShell>
  );
}
