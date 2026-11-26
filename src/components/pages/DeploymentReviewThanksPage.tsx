"use client";

import { Body1, Card, makeStyles, MessageBar, MessageBarBody, Title2, tokens } from "@fluentui/react-components";
import { CheckmarkCircle24Regular } from "@fluentui/react-icons";
import { deploymentReview } from "@/config/launch-kit";
import { site } from "@/config/site";
import { SiteShell } from "../ui/SiteChrome";
import { LinkButton } from "../ui/links";
import { Section } from "../ui/Layout";
import { ButtonRow, IconTile } from "./PageBits";

const useStyles = makeStyles({
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "24px",
    "@media (min-width: 768px)": { padding: "32px" },
  },
  muted: { color: tokens.colorNeutralForeground2 },
});

export default function DeploymentReviewThanksPage() {
  const s = useStyles();
  return (
    <SiteShell>
      <Section narrow>
        <Card className={s.card}>
          <IconTile icon={<CheckmarkCircle24Regular />} tone="success" />
          <Title2 as="h1">Your deployment review is in the queue.</Title2>
          <Body1 className={s.muted}>
            The review will use the deployment URL, GitHub issue, and concern you entered in Stripe checkout. Expect a
            concise written review focused on DNS authentication, provider readiness (Brevo or Amazon SES), webhook
            coverage, and launch risks.
          </Body1>
          <MessageBar intent="warning" layout="multiline">
            <MessageBarBody>
              Do not send credentials. If more context is needed, share sanitized config snippets or a public/private
              GitHub issue link through the same email used at checkout.
            </MessageBarBody>
          </MessageBar>
          <ButtonRow>
            <LinkButton href="/" appearance="primary">
              Back to {site.name}
            </LinkButton>
            <LinkButton href={deploymentReview.productUrl}>Review scope</LinkButton>
          </ButtonRow>
        </Card>
      </Section>
    </SiteShell>
  );
}
