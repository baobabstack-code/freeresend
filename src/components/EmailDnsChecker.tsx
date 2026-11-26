"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Badge,
  Body1,
  Button,
  Caption1,
  Card,
  Field,
  Input,
  makeStyles,
  mergeClasses,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  Subtitle1,
  Text,
  Title1,
  Title3,
  tokens,
  type BadgeProps,
} from "@fluentui/react-components";
import {
  CheckmarkCircle20Filled,
  DismissCircle20Filled,
  Info20Filled,
  MailCheckmark24Regular,
  Open16Regular,
  Search20Regular,
  Warning20Filled,
} from "@fluentui/react-icons";
import { deploymentReview, launchKit } from "@/config/launch-kit";
import { site } from "@/config/site";
import {
  emailDnsProviderLabels,
  type EmailDnsAssessment,
  type EmailDnsCheck,
  type EmailDnsStatus,
} from "@/lib/email-dns-readiness";
import { Container, Eyebrow } from "./ui/Layout";
import { LinkButton } from "./ui/links";
import { IconTile, PromoBand } from "./pages/PageBits";

const statusStyles: Record<
  EmailDnsStatus,
  { label: string; icon: React.ReactElement; color: BadgeProps["color"] }
> = {
  pass: { label: "Pass", icon: <CheckmarkCircle20Filled />, color: "success" },
  warn: { label: "Review", icon: <Warning20Filled />, color: "warning" },
  fail: { label: "Fix", icon: <DismissCircle20Filled />, color: "danger" },
  info: { label: "Info", icon: <Info20Filled />, color: "informative" },
};

const useStyles = makeStyles({
  section: {
    paddingTop: "32px",
    paddingBottom: "48px",
    "@media (min-width: 768px)": { paddingTop: "56px", paddingBottom: "72px" },
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "24px",
    alignItems: "start",
    "@media (min-width: 1024px)": { gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)", gap: "32px" },
  },
  formCard: { display: "flex", flexDirection: "column", gap: "16px", padding: "24px" },
  title: {
    fontSize: tokens.fontSizeHero700,
    lineHeight: tokens.lineHeightHero700,
    "@media (min-width: 768px)": { fontSize: tokens.fontSizeHero800, lineHeight: tokens.lineHeightHero800 },
  },
  muted: { color: tokens.colorNeutralForeground2 },
  subtle: { color: tokens.colorNeutralForeground3 },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  column: { display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 },
  summaryCard: { display: "flex", flexDirection: "column", gap: "8px", padding: "24px" },
  summaryHead: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" },
  summaryText: { display: "flex", flexDirection: "column", gap: "8px", minWidth: 0, flex: "1 1 240px" },
  domainLabel: { overflowWrap: "anywhere" },
  providers: { display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" },
  checks: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "16px",
    "@media (min-width: 768px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  },
  checkCard: { display: "flex", flexDirection: "column", gap: "12px", padding: "20px", minWidth: 0 },
  checkHead: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" },
  checkTitle: { display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: "1 1 160px" },
  details: { margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" },
  detail: { color: tokens.colorNeutralForeground2, overflowWrap: "anywhere" },
  records: {
    display: "flex",
    flexDirection: "column",
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground3,
    overflow: "hidden",
  },
  record: {
    display: "block",
    padding: "8px 12px",
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase300,
    color: tokens.colorNeutralForeground1,
    overflowWrap: "anywhere",
    wordBreak: "break-all",
    ":not(:last-child)": { borderBottom: `1px solid ${tokens.colorNeutralStroke2}` },
  },
  placeholder: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "20px",
    borderRadius: tokens.borderRadiusLarge,
    border: `1px dashed ${tokens.colorNeutralStroke1}`,
    color: tokens.colorNeutralForeground3,
  },
  bar: { height: "8px", borderRadius: "4px", backgroundColor: tokens.colorNeutralBackground4 },
  barShort: { width: "64px" },
  barMid: { width: "66%" },
});

function StatusBadge({ status }: { status: EmailDnsStatus }) {
  const style = statusStyles[status];
  return (
    <Badge appearance="tint" color={style.color} icon={style.icon} size="large" shape="rounded">
      {style.label}
    </Badge>
  );
}

function CheckCard({ check }: { check: EmailDnsCheck }) {
  const s = useStyles();
  return (
    <Card className={s.checkCard}>
      <div className={s.checkHead}>
        <div className={s.checkTitle}>
          <Subtitle1 as="h3">{check.title}</Subtitle1>
          <Body1 className={s.muted}>{check.summary}</Body1>
        </div>
        <StatusBadge status={check.status} />
      </div>
      <ul className={s.details}>
        {check.details.map((detail) => (
          <li key={detail}>
            <Body1 className={s.detail}>{detail}</Body1>
          </li>
        ))}
      </ul>
      {check.records.length > 0 ? (
        <div className={s.records} aria-label={`${check.title} records found`}>
          {check.records.map((record) => (
            <code key={record} className={s.record}>
              {record}
            </code>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

export default function EmailDnsChecker() {
  const s = useStyles();
  const [domain, setDomain] = useState("");
  const [dkimSelector, setDkimSelector] = useState("");
  const [result, setResult] = useState<EmailDnsAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resultTitle = useMemo(() => {
    if (!result) return "Check your sending domain";
    if (result.overallStatus === "fail") return "Fix these records before launch";
    if (result.overallStatus === "warn") return "Review these DNS warnings";
    return "DNS looks ready for a closer launch pass";
  }, [result]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/email-dns-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, dkimSelector }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "DNS check failed.");
      }

      setResult(payload as EmailDnsAssessment);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={s.section}>
      <Container>
        <div className={s.layout}>
          <Card className={s.formCard}>
            <IconTile icon={<MailCheckmark24Regular />} />
            <Eyebrow>Free tool</Eyebrow>
            <Title1 as="h1" className={s.title}>
              Email DNS readiness checker
            </Title1>
            <Text className={s.muted}>
              Check SPF, DMARC, MX and one DKIM selector before sending production email from a domain. Works for
              domains sending through Brevo or Amazon SES with {site.name}.
            </Text>

            <form className={s.form} onSubmit={handleSubmit} noValidate>
              <Field label="Sending domain" required>
                <Input
                  name="domain"
                  value={domain}
                  onChange={(_, d) => setDomain(d.value)}
                  placeholder="example.com"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={loading}
                />
              </Field>
              <Field
                label="DKIM selector"
                hint="Optional. Use mail for Brevo, or one of the DKIM tokens shown in Amazon SES."
              >
                <Input
                  name="dkimSelector"
                  value={dkimSelector}
                  onChange={(_, d) => setDkimSelector(d.value)}
                  placeholder="mail"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={loading}
                />
              </Field>
              <Button
                type="submit"
                appearance="primary"
                size="large"
                disabled={loading || !domain.trim()}
                icon={loading ? <Spinner size="tiny" /> : <Search20Regular />}
              >
                {loading ? "Checking DNS…" : "Run DNS check"}
              </Button>
            </form>

            {error ? (
              <MessageBar intent="error">
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            ) : null}

            <MessageBar intent="warning">
              <MessageBarBody>
                Never paste API keys, AWS keys, SMTP passwords, database URLs or private tokens into this checker.
              </MessageBarBody>
            </MessageBar>
          </Card>

          <div className={s.column} aria-live="polite">
            <Card className={s.summaryCard}>
              <div className={s.summaryHead}>
                <div className={s.summaryText}>
                  <Eyebrow>
                    <span className={s.domainLabel}>{result?.domain ?? "Results"}</span>
                  </Eyebrow>
                  <Title3 as="h2">{resultTitle}</Title3>
                  <Body1 className={s.muted}>
                    {result?.summary ??
                      "Run the checker to see the records that most often block a launch, then use the launch kit or deployment review for the rest of the rollout."}
                  </Body1>
                  {result && result.providers?.length ? (
                    <div className={s.providers}>
                      <Caption1 className={s.subtle}>Provider records found:</Caption1>
                      {result.providers.map((provider) => (
                        <Badge key={provider} appearance="outline" color="brand">
                          {emailDnsProviderLabels[provider]}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
                {result ? <StatusBadge status={result.overallStatus} /> : null}
              </div>
            </Card>

            {result ? (
              <>
                <div className={s.checks}>
                  {result.checks.map((check) => (
                    <CheckCard key={check.id} check={check} />
                  ))}
                </div>
                {result.lookupErrors.length > 0 ? (
                  <MessageBar intent="info">
                    <MessageBarBody>
                      <MessageBarTitle>DNS lookup warnings</MessageBarTitle>
                      {result.lookupErrors.join("; ")}
                    </MessageBarBody>
                  </MessageBar>
                ) : null}
              </>
            ) : (
              <div className={s.checks} aria-hidden="true">
                {["SPF", "DMARC", "DKIM", "MX"].map((item) => (
                  <div key={item} className={s.placeholder}>
                    <div className={mergeClasses(s.bar, s.barShort)} />
                    <Subtitle1>{item}</Subtitle1>
                    <div className={s.bar} />
                    <div className={mergeClasses(s.bar, s.barMid)} />
                  </div>
                ))}
              </div>
            )}

            <PromoBand
              title="Need a production pass?"
              actions={
                <>
                  <LinkButton
                    href={deploymentReview.checkoutUrl}
                    target="_blank"
                    appearance="primary"
                    icon={<Open16Regular />}
                    iconPosition="after"
                  >
                    Book review for {deploymentReview.price}
                  </LinkButton>
                  <LinkButton href={launchKit.checkoutUrl} target="_blank" icon={<Open16Regular />} iconPosition="after">
                    Buy launch kit
                  </LinkButton>
                </>
              }
            >
              The checker only sees public DNS. The {deploymentReview.price} deployment review covers SES sandbox status,
              region choice, DKIM alignment, webhook gaps and the next launch fixes from your deployment URL.
            </PromoBand>
          </div>
        </div>
      </Container>
    </section>
  );
}
