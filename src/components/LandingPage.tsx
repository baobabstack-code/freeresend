"use client";

import { useState } from "react";
import {
  Badge,
  Body1,
  Body2,
  Button,
  Caption1,
  Card,
  Display,
  makeStyles,
  mergeClasses,
  Subtitle1,
  Subtitle2,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TabList,
  Text,
  Title2,
  Title3,
  tokens,
  Tooltip,
} from "@fluentui/react-components";
import {
  ArrowRight20Regular,
  ArrowSync24Regular,
  Building24Regular,
  Checkmark20Regular,
  CheckmarkCircle20Filled,
  Code24Regular,
  Copy20Regular,
  DataHistogram24Regular,
  DocumentSearch24Regular,
  Globe24Regular,
  Key24Regular,
  Mail24Regular,
  PlugConnected24Regular,
  Send24Regular,
  ShieldCheckmark24Regular,
} from "@fluentui/react-icons";
import { SiteShell } from "./ui/SiteChrome";
import { Container, Eyebrow, Section } from "./ui/Layout";
import { AppLink, LinkButton } from "./ui/links";
import { copyText } from "./ui/CopyField";
import { useNotify } from "./ui/toast";
import { site } from "@/config/site";

const API_BASE = `${site.url}/api`;

const CODE_SAMPLES = {
  sdk: {
    label: "Resend SDK",
    caption: "Point the Resend SDK at Baobab Mail. Your existing code keeps working.",
    code: `# .env
RESEND_BASE_URL="${API_BASE}"

// send.ts
import { Resend } from "resend";

const resend = new Resend(process.env.BAOBAB_MAIL_API_KEY);

await resend.emails.send({
  from: "hello@yourdomain.com",
  to: ["customer@example.com"],
  subject: "Welcome aboard",
  html: "<strong>It works!</strong>",
});`,
  },
  http: {
    label: "HTTP API",
    caption: "Or call the REST endpoint directly from any language.",
    code: `curl -X POST "${API_BASE}/emails" \\
  -H "Authorization: Bearer $BAOBAB_MAIL_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "hello@yourdomain.com",
    "to": ["customer@example.com"],
    "subject": "Welcome aboard",
    "html": "<strong>It works!</strong>"
  }'`,
  },
} as const;

type SampleKey = keyof typeof CODE_SAMPLES;

const HIGHLIGHTS = [
  "Resend-compatible API",
  "Brevo or Amazon SES",
  "Automatic DNS records",
  "Delivery webhooks",
];

const FEATURES = [
  {
    icon: <Code24Regular />,
    title: "Drop-in Resend compatibility",
    description:
      "Keep the Resend SDK and request format you already use. Change the base URL and API key, and your sending code stays the same.",
  },
  {
    icon: <PlugConnected24Regular />,
    title: "Brevo or Amazon SES",
    description:
      "Choose the provider that fits: start on Brevo's free tier with no card needed, or send through Amazon SES at scale.",
  },
  {
    icon: <Globe24Regular />,
    title: "Automatic DNS setup",
    description:
      "Add a domain and get the exact SPF, DKIM and DMARC records to publish, with automatic record creation when your DNS is on DigitalOcean.",
  },
  {
    icon: <ArrowSync24Regular />,
    title: "Delivery tracking via webhooks",
    description:
      "Delivery, bounce and complaint events from your provider flow back in and update each email's status automatically.",
  },
  {
    icon: <Key24Regular />,
    title: "Per-domain API keys",
    description:
      "Issue separate keys for each sending domain, so every app or environment has its own credentials you can revoke at any time.",
  },
  {
    icon: <DataHistogram24Regular />,
    title: "Dashboard and email logs",
    description:
      "See every message you've sent, its delivery status and provider response, all from one clean dashboard.",
  },
];

const STEPS = [
  {
    title: "Add your domain",
    description: "Register the domain you want to send from and pick Brevo or Amazon SES as its provider.",
  },
  {
    title: "Publish the DNS records",
    description: "Copy the generated SPF, DKIM and DMARC records into your DNS, or let them be created for you.",
  },
  {
    title: "Send with your API key",
    description: "Create an API key for the domain and send through the Resend SDK or a plain HTTP request.",
  },
];

const PROVIDERS = [
  {
    name: "Brevo",
    badge: "Free tier",
    badgeColor: "success" as const,
    summary: "The quickest way to get started. Sign up for a free Brevo account, no card needed, and connect it with an API key.",
    points: ["Free tier to get started", "Simple API-key setup", "Delivery events via webhooks"],
  },
  {
    name: "Amazon SES",
    badge: "Built for scale",
    badgeColor: "informative" as const,
    summary: "Pay-as-you-go sending on AWS infrastructure, ideal once your volume grows or you already run on AWS.",
    points: ["Low per-email pricing", "Bounce and complaint notifications", "Production-access guide and request helper"],
  },
];

const COMPARISON = [
  { feature: "API", ours: "Resend-compatible", theirs: "Proprietary" },
  { feature: "Sending provider", ours: "Your choice: Brevo or Amazon SES", theirs: "Fixed by the vendor" },
  { feature: "Domain DNS setup", ours: "Records generated for you", theirs: "Varies by service" },
  { feature: "Delivery events", ours: "Webhooks from your provider", theirs: "Varies by service" },
  { feature: "Cost", ours: "Provider rates, often far lower", theirs: "Premium per-email pricing" },
];

const useStyles = makeStyles({
  hero: {
    position: "relative",
    overflow: "hidden",
    paddingTop: "48px",
    paddingBottom: "56px",
    backgroundImage:
      "radial-gradient(circle at 10% 0%, rgba(245, 158, 11, 0.18), transparent 45%), radial-gradient(circle at 95% 90%, rgba(16, 185, 129, 0.12), transparent 40%)",
    "@media (min-width: 768px)": { paddingTop: "88px", paddingBottom: "96px" },
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "40px",
    alignItems: "center",
    "@media (min-width: 1024px)": { gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)", gap: "56px" },
  },
  heroText: { display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 },
  heroTitle: {
    fontSize: "36px",
    lineHeight: "44px",
    letterSpacing: "-0.02em",
    "@media (min-width: 768px)": { fontSize: tokens.fontSizeHero900, lineHeight: tokens.lineHeightHero900 },
    "@media (min-width: 1024px)": { fontSize: tokens.fontSizeHero1000, lineHeight: tokens.lineHeightHero1000 },
  },
  accent: { color: tokens.colorBrandForeground1 },
  lead: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase500,
    maxWidth: "620px",
  },
  badges: { display: "flex", flexWrap: "wrap", gap: "8px" },
  ctas: { display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" },
  muted: { color: tokens.colorNeutralForeground3 },
  checks: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 20px",
    listStyleType: "none",
    margin: 0,
    padding: 0,
  },
  checkItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: tokens.colorNeutralForeground2,
  },
  checkIcon: { color: tokens.colorPaletteGreenForeground1, flexShrink: 0 },

  codeCard: {
    padding: 0,
    overflow: "hidden",
    minWidth: 0,
    boxShadow: tokens.shadow28,
  },
  codeBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "8px 8px 8px 12px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    flexWrap: "wrap",
  },
  codeBody: {
    margin: 0,
    padding: "16px",
    backgroundColor: tokens.colorNeutralBackground3,
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase300,
    color: tokens.colorNeutralForeground1,
    overflowX: "auto",
    whiteSpace: "pre",
    "@media (min-width: 768px)": { padding: "20px", fontSize: tokens.fontSizeBase300, lineHeight: tokens.lineHeightBase400 },
  },
  codeCaption: {
    display: "block",
    padding: "10px 16px 12px",
    color: tokens.colorNeutralForeground3,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },

  sectionHead: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "10px",
    maxWidth: "720px",
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: "40px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "16px",
    "@media (min-width: 640px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
    "@media (min-width: 1024px)": { gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "20px" },
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "20px",
    "@media (min-width: 768px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  },
  featureCard: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    height: "100%",
    boxSizing: "border-box",
  },
  iconTile: {
    width: "44px",
    height: "44px",
    borderRadius: tokens.borderRadiusLarge,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: tokens.colorBrandForeground1,
    backgroundColor: tokens.colorBrandBackground2,
    flexShrink: 0,
  },

  steps: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "16px",
    listStyleType: "none",
    margin: 0,
    padding: 0,
    "@media (min-width: 768px)": { gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "20px" },
  },
  stepNumber: {
    width: "36px",
    height: "36px",
    borderRadius: tokens.borderRadiusCircular,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForegroundOnBrand,
    backgroundColor: tokens.colorBrandBackground,
    flexShrink: 0,
  },

  providerCard: { padding: "28px", display: "flex", flexDirection: "column", gap: "14px" },
  providerHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" },
  pointList: { display: "flex", flexDirection: "column", gap: "8px", listStyleType: "none", margin: 0, padding: 0 },

  tableWrap: {
    overflowX: "auto",
    borderRadius: tokens.borderRadiusXLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  table: { minWidth: "520px" },
  oursCell: { color: tokens.colorBrandForeground1, fontWeight: tokens.fontWeightSemibold },
  footnote: { display: "block", marginTop: "12px", textAlign: "center", color: tokens.colorNeutralForeground3 },

  resourceCard: { padding: "20px", display: "flex", flexDirection: "column", gap: "8px", height: "100%", boxSizing: "border-box" },

  ctaBand: {
    paddingTop: "56px",
    paddingBottom: "56px",
    backgroundColor: tokens.colorNeutralBackground2,
    backgroundImage:
      "radial-gradient(circle at 0% 100%, rgba(245, 158, 11, 0.20), transparent 50%), radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.14), transparent 45%)",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    "@media (min-width: 768px)": { paddingTop: "80px", paddingBottom: "80px" },
  },
  ctaInner: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" },
  centerCtas: { justifyContent: "center" },
});

function CodeSample() {
  const s = useStyles();
  const notify = useNotify();
  const [tab, setTab] = useState<SampleKey>("sdk");
  const [copied, setCopied] = useState(false);
  const sample = CODE_SAMPLES[tab];

  const onCopy = async () => {
    if (await copyText(sample.code)) {
      setCopied(true);
      notify.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } else {
      notify.error("Couldn't copy", "Select the code and copy it manually.");
    }
  };

  return (
    <Card className={s.codeCard} appearance="filled-alternative">
      <div className={s.codeBar}>
        <TabList
          size="small"
          selectedValue={tab}
          onTabSelect={(_, d) => {
            setTab(d.value as SampleKey);
            setCopied(false);
          }}
          aria-label="Code example language"
        >
          {(Object.keys(CODE_SAMPLES) as SampleKey[]).map((key) => (
            <Tab key={key} value={key}>
              {CODE_SAMPLES[key].label}
            </Tab>
          ))}
        </TabList>
        <Tooltip content={copied ? "Copied" : "Copy code"} relationship="label">
          <Button
            appearance="subtle"
            icon={copied ? <Checkmark20Regular /> : <Copy20Regular />}
            onClick={onCopy}
          />
        </Tooltip>
      </div>
      <pre className={s.codeBody} tabIndex={0} aria-label={`${sample.label} example`}>
        <code>{sample.code}</code>
      </pre>
      <Caption1 className={s.codeCaption}>{sample.caption}</Caption1>
    </Card>
  );
}

function SectionHead({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  const s = useStyles();
  return (
    <div className={s.sectionHead}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Title2 as="h2">{title}</Title2>
      {description ? <Body2 className={s.muted}>{description}</Body2> : null}
    </div>
  );
}

export default function LandingPage() {
  const s = useStyles();

  return (
    <SiteShell>
      {/* Hero */}
      <section className={s.hero} aria-labelledby="hero-title">
        <Container>
          <div className={s.heroGrid}>
            <div className={s.heroText}>
              <div className={s.badges}>
                <Badge appearance="tint" color="brand" shape="rounded" size="large">
                  Resend-compatible
                </Badge>
                <Badge appearance="tint" color="success" shape="rounded" size="large">
                  Brevo or Amazon SES
                </Badge>
              </div>
              <Display as="h1" id="hero-title" className={s.heroTitle}>
                Transactional email, <span className={s.accent}>sent from your own domain</span>
              </Display>
              <Body1 className={s.lead}>
                {site.name} is a Resend-compatible email API by {site.company}. Connect Brevo or Amazon SES,
                verify your domain with automatically generated DNS records, and track every delivery from one
                dashboard.
              </Body1>
              <div className={s.ctas}>
                <LinkButton href="/pricing" appearance="primary" size="large" icon={<ArrowRight20Regular />} iconPosition="after">
                  See pricing
                </LinkButton>
                <LinkButton href="/login" appearance="outline" size="large">
                  Sign in
                </LinkButton>
              </div>
              <ul className={s.checks} aria-label="Highlights">
                {HIGHLIGHTS.map((h) => (
                  <li key={h} className={s.checkItem}>
                    <CheckmarkCircle20Filled className={s.checkIcon} aria-hidden />
                    <Text>{h}</Text>
                  </li>
                ))}
              </ul>
            </div>
            <CodeSample />
          </div>
        </Container>
      </section>

      {/* Features */}
      <Section id="features" alt>
        <SectionHead
          eyebrow="Features"
          title="Everything you need to send reliable email"
          description="Production-ready building blocks for transactional email, without building your own email infrastructure."
        />
        <div className={s.grid3}>
          {FEATURES.map((f) => (
            <Card key={f.title} className={s.featureCard}>
              <div className={s.iconTile} aria-hidden>
                {f.icon}
              </div>
              <Subtitle1 as="h3">{f.title}</Subtitle1>
              <Body1 className={s.muted}>{f.description}</Body1>
            </Card>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section id="how-it-works">
        <SectionHead
          eyebrow="How it works"
          title="From domain to first email in three steps"
          description="Already using Resend? Point the SDK's base URL at your Baobab Mail API and swap in your API key."
        />
        <ol className={s.steps}>
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <Card className={s.featureCard}>
                <span className={s.stepNumber} aria-hidden>
                  {i + 1}
                </span>
                <Subtitle1 as="h3">{step.title}</Subtitle1>
                <Body1 className={s.muted}>{step.description}</Body1>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* Providers */}
      <Section id="providers" alt>
        <SectionHead
          eyebrow="Providers"
          title="Your provider, your choice"
          description="Set the provider per domain. Start free with Brevo and move to Amazon SES when your volume calls for it."
        />
        <div className={s.grid2}>
          {PROVIDERS.map((p) => (
            <Card key={p.name} className={s.providerCard}>
              <div className={s.providerHead}>
                <Title3 as="h3">{p.name}</Title3>
                <Badge appearance="tint" color={p.badgeColor} shape="rounded">
                  {p.badge}
                </Badge>
              </div>
              <Body1 className={s.muted}>{p.summary}</Body1>
              <ul className={s.pointList}>
                {p.points.map((pt) => (
                  <li key={pt} className={s.checkItem}>
                    <CheckmarkCircle20Filled className={s.checkIcon} aria-hidden />
                    <Text>{pt}</Text>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      {/* Comparison */}
      <Section id="compare" narrow>
        <SectionHead
          eyebrow="Compare"
          title={`${site.name} vs. premium email services`}
          description="The developer experience you expect, at your provider's rates."
        />
        <div className={s.tableWrap}>
          <Table className={s.table} aria-label={`${site.name} compared with premium email services`}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Feature</TableHeaderCell>
                <TableHeaderCell>{site.name}</TableHeaderCell>
                <TableHeaderCell>Premium services</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPARISON.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell>
                    <Text weight="semibold">{row.feature}</Text>
                  </TableCell>
                  <TableCell className={s.oursCell}>{row.ours}</TableCell>
                  <TableCell className={s.muted}>{row.theirs}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Caption1 className={s.footnote}>
          Want numbers for your volume? <AppLink href="/pricing">Compare costs with Resend&apos;s pricing</AppLink>.
        </Caption1>
      </Section>

      {/* Resources */}
      <Section id="resources" alt>
        <SectionHead eyebrow="Resources" title="Free tools to launch with confidence" />
        <div className={s.grid3}>
          <Card className={s.resourceCard}>
            <div className={s.iconTile} aria-hidden>
              <DocumentSearch24Regular />
            </div>
            <Subtitle2 as="h3">Email DNS checker</Subtitle2>
            <Body1 className={s.muted}>Check SPF, DKIM and DMARC for any domain before your first send.</Body1>
            <AppLink href="/tools/email-dns-checker">Check a domain</AppLink>
          </Card>
          <Card className={s.resourceCard}>
            <div className={s.iconTile} aria-hidden>
              <ShieldCheckmark24Regular />
            </div>
            <Subtitle2 as="h3">SES production guide</Subtitle2>
            <Body1 className={s.muted}>
              Sandbox status, authentication, bounce handling and rollback planning for Amazon SES.
            </Body1>
            <AppLink href="/guides/ses-production-readiness">Read the guide</AppLink>
          </Card>
          <Card className={s.resourceCard}>
            <div className={s.iconTile} aria-hidden>
              <Send24Regular />
            </div>
            <Subtitle2 as="h3">SES request helper</Subtitle2>
            <Body1 className={s.muted}>Draft a clear Amazon SES production-access request, without sharing secrets.</Body1>
            <AppLink href="/tools/ses-production-request-helper">Draft a request</AppLink>
          </Card>
        </div>
      </Section>

      {/* Final CTA */}
      <section className={s.ctaBand} aria-labelledby="cta-title">
        <Container narrow>
          <div className={s.ctaInner}>
            <div className={s.iconTile} aria-hidden>
              <Mail24Regular />
            </div>
            <Title2 as="h2" id="cta-title">
              Ready to send from your own domain?
            </Title2>
            <Body2 className={s.muted}>
              See what {site.name} costs for your volume, or talk to the {site.company} team about your setup.
            </Body2>
            <div className={mergeClasses(s.ctas, s.centerCtas)}>
              <LinkButton href="/pricing" appearance="primary" size="large" icon={<ArrowRight20Regular />} iconPosition="after">
                Get started
              </LinkButton>
              <LinkButton
                href={site.contactUrl}
                target="_blank"
                appearance="outline"
                size="large"
                icon={<Building24Regular />}
              >
                Talk to {site.company}
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
