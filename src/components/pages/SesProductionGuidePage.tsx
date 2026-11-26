"use client";

import { Body1, Card, makeStyles, Title3, tokens } from "@fluentui/react-components";
import {
  Alert24Regular,
  ArrowRight16Regular,
  ArrowRight20Regular,
  ClipboardTask20Regular,
  ClipboardTaskListLtr24Regular,
  Flow24Regular,
  MailCheckmark20Regular,
  MailCheckmark24Regular,
  Open16Regular,
  Pulse24Regular,
  ShieldCheckmark24Regular,
  Warning20Filled,
} from "@fluentui/react-icons";
import { deploymentReview, launchKit, sesRequestHelper } from "@/config/launch-kit";
import { site } from "@/config/site";
import { SiteShell } from "../ui/SiteChrome";
import { Eyebrow, Section } from "../ui/Layout";
import { LinkButton } from "../ui/links";
import { CheckList, FeatureCard, Grid, IconTile, Muted, PageHero, PromoBand } from "./PageBits";

const readinessSteps = [
  {
    icon: <ShieldCheckmark24Regular />,
    title: "Authenticate the sending domain",
    copy: "Verify the domain in SES, publish DKIM records, keep SPF aligned with the real sender, and set a DMARC policy that reports failures before it rejects mail.",
    checks: ["DKIM records resolve", "SPF includes the sending path", "DMARC reporting address works"],
  },
  {
    icon: <MailCheckmark24Regular />,
    title: "Move SES out of sandbox deliberately",
    copy: "Confirm the production region, requested daily quota, expected peak send rate, suppression list behaviour, and the account identity that will own the launch.",
    checks: ["Production access approved", "Quota matches first-week traffic", "Region matches app config"],
  },
  {
    icon: <Flow24Regular />,
    title: "Wire bounce and complaint events",
    copy: `Use SNS or EventBridge to feed ${site.name} webhook handling, then test the path before any customer-facing transactional mail depends on it.`,
    checks: ["Bounce path tested", "Complaint path tested", "Suppression updates observable"],
  },
  {
    icon: <Pulse24Regular />,
    title: "Run a production smoke test",
    copy: "Send a low-volume test from the production app path, inspect headers, confirm logs, and make sure rollback does not require editing secrets in a hurry.",
    checks: ["Headers show aligned domain", "App logs preserve message IDs", "Rollback owner is named"],
  },
];

const launchRisks = [
  "SES remains in sandbox while the app is already configured for production traffic.",
  "A DMARC record exists, but reports go nowhere or the policy hides DKIM alignment failures.",
  "Bounce and complaint webhooks are configured after launch instead of before the first real send.",
  "The team has no low-risk rollback path if DNS, secrets, or SES quotas are wrong.",
];

const handoffQuestions = [
  "Which domain and subdomain will send transactional mail?",
  "Which AWS account, SES region, and quota request own this launch?",
  "Where do bounces, complaints, and delivery events appear after a send?",
  "Who can roll back the sender configuration during the first production hour?",
];

const useStyles = makeStyles({
  asideCard: { display: "flex", flexDirection: "column", gap: "12px", padding: "24px" },
  asideHead: { display: "flex", gap: "12px", alignItems: "flex-start" },
  asideText: { display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 },
  sectionHead: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px", maxWidth: "720px" },
  stepCopy: { color: tokens.colorNeutralForeground2 },
  riskCard: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "24px",
    border: `1px solid ${tokens.colorPaletteYellowBorder1}`,
  },
  riskIcon: { color: tokens.colorPaletteYellowForeground2 },
  card: { display: "flex", flexDirection: "column", gap: "12px", padding: "24px" },
  arrowIcon: { color: tokens.colorBrandForeground1 },
  spacer: { marginTop: "24px" },
});

export default function SesProductionGuidePage() {
  const s = useStyles();
  return (
    <SiteShell>
      <PageHero
        eyebrow="Free production checklist · Amazon SES"
        title={`Get ${site.name} ready for production Amazon SES traffic.`}
        lead={
          <>
            {site.name} sends through Brevo or Amazon SES. If you are using SES, work through this guide before pointing
            a real application at it. It focuses on the launch details that usually cause the first production incident:
            SES sandbox access, DNS authentication, webhook coverage, smoke tests, monitoring, and rollback ownership.
          </>
        }
        actions={
          <>
            <LinkButton href="/tools/email-dns-checker" appearance="primary" icon={<MailCheckmark20Regular />}>
              Run DNS checker
            </LinkButton>
            <LinkButton href={sesRequestHelper.productUrl} icon={<ClipboardTask20Regular />}>
              Draft SES request
            </LinkButton>
            <LinkButton
              href={deploymentReview.checkoutUrl}
              target="_blank"
              icon={<Open16Regular />}
              iconPosition="after"
            >
              Book review for {deploymentReview.price}
            </LinkButton>
          </>
        }
        aside={
          <Card className={s.asideCard}>
            <div className={s.asideHead}>
              <IconTile icon={<ClipboardTaskListLtr24Regular />} />
              <div className={s.asideText}>
                <Eyebrow>Preflight order</Eyebrow>
                <Title3 as="h2">Do not launch by DNS alone</Title3>
              </div>
            </div>
            <Muted>
              Passing SPF, DKIM, and DMARC is necessary, but production readiness also depends on SES account state,
              event handling, send-rate limits, and the human rollback path.
            </Muted>
          </Card>
        }
      />

      <Section id="checklist">
        <div className={s.sectionHead}>
          <Eyebrow>Checklist</Eyebrow>
          <Title3 as="h2">Four steps before the first production send</Title3>
        </div>
        <Grid cols={2}>
          {readinessSteps.map((step) => (
            <FeatureCard key={step.title} icon={step.icon} title={step.title} headingAs="h3">
              <Body1 className={s.stepCopy}>{step.copy}</Body1>
              <CheckList items={step.checks} />
            </FeatureCard>
          ))}
        </Grid>
      </Section>

      <Section alt>
        <Grid cols={2}>
          <Card className={s.riskCard}>
            <IconTile icon={<Alert24Regular />} tone="warning" />
            <Title3 as="h2">Common launch risks</Title3>
            <CheckList items={launchRisks} icon={<Warning20Filled />} iconClassName={s.riskIcon} />
          </Card>

          <Card className={s.card}>
            <Eyebrow>Handoff questions</Eyebrow>
            <Title3 as="h2">What a reviewer needs before launch</Title3>
            <Muted>
              A useful deployment review does not need secrets. It needs the public sending domain, the intended SES
              region, the deployment notes, and the specific risk you want checked before production traffic.
            </Muted>
            <CheckList items={handoffQuestions} icon={<ArrowRight20Regular />} iconClassName={s.arrowIcon} />
          </Card>
        </Grid>

        <div className={s.spacer}>
          <PromoBand
            eyebrow="Need a second set of eyes?"
            title="Turn the checklist into a deployment review."
            actions={
              <>
                <LinkButton
                  href={deploymentReview.checkoutUrl}
                  target="_blank"
                  appearance="primary"
                  icon={<Open16Regular />}
                  iconPosition="after"
                >
                  Book review
                </LinkButton>
                <LinkButton href={launchKit.productUrl} icon={<ArrowRight16Regular />} iconPosition="after">
                  View launch kit
                </LinkButton>
              </>
            }
          >
            The {deploymentReview.price} review covers one {site.name} deployment plan and returns a concise priority
            report across DNS, SES state, webhook handling, smoke tests, and rollback risk.
          </PromoBand>
        </div>
      </Section>
    </SiteShell>
  );
}
