"use client";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Body1,
  Body2,
  Card,
  Link,
  makeStyles,
  mergeClasses,
  Subtitle1,
  Subtitle2,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Title1,
  tokens,
} from "@fluentui/react-components";
import { ArrowSwap24Regular, Building24Regular, Savings24Regular } from "@fluentui/react-icons";
import PricingCalculator from "./PricingCalculator";
import { Container, Eyebrow, PageHeader, Section } from "./ui/Layout";
import { LinkButton } from "./ui/links";
import { brandColors } from "@/theme/brand";
import { site } from "@/config/site";

const useStyles = makeStyles({
  hero: {
    paddingTop: "40px",
    paddingBottom: "32px",
    textAlign: "center",
    backgroundImage: `radial-gradient(ellipse at top, ${brandColors.amber}1f, transparent 60%)`,
    "@media (min-width: 768px)": { paddingTop: "64px", paddingBottom: "40px" },
  },
  heroInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  heroTitle: {
    "@media (max-width: 480px)": {
      fontSize: tokens.fontSizeHero700,
      lineHeight: tokens.lineHeightHero700,
    },
  },
  heroLead: {
    maxWidth: "720px",
    color: tokens.colorNeutralForeground2,
  },
  calcWrap: { paddingBottom: "48px" },
  ctas: { display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
    "@media (min-width: 768px)": { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
  },
  benefit: { padding: "24px", gap: "10px" },
  benefitIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  muted: { color: tokens.colorNeutralForeground3 },
  band: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "12px",
    padding: "32px 20px",
    borderRadius: tokens.borderRadiusXLarge,
    border: `1px solid ${tokens.colorBrandStroke2}`,
    backgroundColor: tokens.colorBrandBackground2,
    "@media (min-width: 768px)": { padding: "40px" },
  },
  bandActions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "12px",
    marginTop: "8px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "24px",
    "@media (min-width: 900px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  },
  panel: { padding: "20px", gap: "12px", minWidth: 0, "@media (min-width: 768px)": { padding: "24px" } },
  tableScroll: { overflowX: "auto", maxWidth: "100%" },
  table: { minWidth: "320px" },
  formula: {
    display: "block",
    padding: "12px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    overflowWrap: "anywhere",
  },
  list: {
    margin: 0,
    paddingLeft: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: tokens.colorNeutralForeground2,
  },
  providers: { marginTop: "24px" },
  free: { color: tokens.colorStatusSuccessForeground1, fontWeight: tokens.fontWeightSemibold },
});

const RESEND_TIERS = [
  { range: "0 – 3,000 emails", price: "Free" },
  { range: "3,001 – 50,000 emails", price: "$20/month" },
  { range: "50,001 – 100,000 emails", price: "$35/month" },
  { range: "100,001 – 200,000 emails", price: "$160/month" },
  { range: "200,001+ emails", price: "$350+/month" },
];

const PROVIDERS = [
  {
    name: "Brevo (free plan)",
    cost: "Free, about 300 emails a day",
    card: "No",
    bestFor: "Getting started and low volumes",
  },
  {
    name: "Amazon SES",
    cost: "Pay per use, about $0.10 per 1,000 emails",
    card: "Yes (AWS account)",
    bestFor: "Growing and high volumes",
  },
];

const FAQ = [
  {
    q: `Why does ${site.name} cost less?`,
    a: `${site.name} sends through your own Brevo or Amazon SES account, so there is no markup on every email. You pay the provider directly, and Brevo's free plan covers about 300 emails a day at no cost.`,
  },
  {
    q: "Is it really compatible with Resend?",
    a: `Yes. Point the Resend SDK at your ${site.name} URL (for example with the RESEND_BASE_URL environment variable) and your existing code keeps working.`,
  },
  {
    q: "What about deliverability?",
    a: `Brevo and Amazon SES are established sending services with strong deliverability. ${site.name} gives you the DNS records your domain needs to authenticate its mail.`,
  },
  {
    q: "Do I need an AWS account?",
    a: `No. You can start on Brevo's free plan without a card. If you choose Amazon SES, ${site.name} handles domain verification and DKIM setup for you.`,
  },
  {
    q: "What about support?",
    a: `${site.name} is open source with community support. For hands-on help with setup or production, ${site.company} is happy to help.`,
    contact: true,
  },
  {
    q: "Can I self-host it?",
    a: "Absolutely. It runs with Docker, on Vercel or on any Node.js host.",
  },
];

/** Body of /pricing. The CTA blocks are passed in from the server page. */
export default function PricingPageBody({ ctas }: { ctas?: React.ReactNode }) {
  const s = useStyles();

  return (
    <>
      <div className={s.hero}>
        <Container narrow>
          <div className={s.heroInner}>
            <Eyebrow>Pricing</Eyebrow>
            <Title1 as="h1" className={s.heroTitle}>
              Pricing calculator
            </Title1>
            <Body2 className={s.heroLead}>
              See what you would pay Resend for your email volume, and what the same volume costs with{" "}
              {site.name} on Brevo or Amazon SES. The estimate includes hosting and upkeep, not just
              sending fees.
            </Body2>
          </div>
        </Container>
      </div>

      <Container className={s.calcWrap}>
        <PricingCalculator />
      </Container>

      {ctas ? (
        <Section alt>
          <div className={s.ctas}>{ctas}</div>
        </Section>
      ) : null}

      <Section>
        <PageHeader as="h2" title={`Why teams choose ${site.name}`} />
        <div className={s.grid3}>
          <Card className={s.benefit}>
            <span className={s.benefitIcon} aria-hidden="true">
              <Savings24Regular />
            </span>
            <Subtitle1 as="h3">Lower sending costs</Subtitle1>
            <Body1 className={s.muted}>
              Use Brevo&apos;s free plan (about 300 emails a day, no card needed) or Amazon SES at about
              $0.10 per 1,000 emails, with no markup on top.
            </Body1>
          </Card>
          <Card className={s.benefit}>
            <span className={s.benefitIcon} aria-hidden="true">
              <ArrowSwap24Regular />
            </span>
            <Subtitle1 as="h3">One-line migration</Subtitle1>
            <Body1 className={s.muted}>
              Change one environment variable and your existing Resend SDK code sends through{" "}
              {site.name}. No other code changes.
            </Body1>
          </Card>
          <Card className={s.benefit}>
            <span className={s.benefitIcon} aria-hidden="true">
              <Building24Regular />
            </span>
            <Subtitle1 as="h3">Your domain, your control</Subtitle1>
            <Body1 className={s.muted}>
              Send from your own domain with your own provider account, on infrastructure you choose.
            </Body1>
          </Card>
        </div>
      </Section>

      <Section alt>
        <PageHeader as="h2" title="How the numbers work" />
        <div className={s.twoCol}>
          <Card className={s.panel}>
            <Subtitle2 as="h3">Resend pricing tiers</Subtitle2>
            <div className={s.tableScroll}>
              <Table size="small" className={s.table} aria-label="Resend pricing tiers">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Monthly volume</TableHeaderCell>
                    <TableHeaderCell>Price</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RESEND_TIERS.map((t) => (
                    <TableRow key={t.range}>
                      <TableCell>{t.range}</TableCell>
                      <TableCell>
                        <span className={t.price === "Free" ? s.free : undefined}>{t.price}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card className={s.panel}>
            <Subtitle2 as="h3">{site.name} formula</Subtitle2>
            <code className={s.formula}>
              Total = Platform fee + Hosting + Maintenance + (Volume ÷ 1,000) × Sending rate
            </code>
            <ul className={s.list}>
              <li>Platform fee: $0 when you self-host the open-source app</li>
              <li>
                Sending rate: $0 on Brevo&apos;s free plan (about 300 emails a day), or about $0.10 per
                1,000 emails on Amazon SES
              </li>
              <li>Hosting and maintenance: your own server and time, adjustable in the calculator</li>
              <li>Linear pricing, with no tier jumps</li>
            </ul>
          </Card>
        </div>

        <Card className={mergeClasses(s.panel, s.providers)}>
          <Subtitle2 as="h3">Choosing a sending provider</Subtitle2>
          <div className={s.tableScroll}>
            <Table size="small" className={s.table} aria-label="Sending provider comparison">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Provider</TableHeaderCell>
                  <TableHeaderCell>Cost</TableHeaderCell>
                  <TableHeaderCell>Card needed</TableHeaderCell>
                  <TableHeaderCell>Best for</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROVIDERS.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell>
                      <Text weight="semibold">{p.name}</Text>
                    </TableCell>
                    <TableCell>{p.cost}</TableCell>
                    <TableCell>{p.card}</TableCell>
                    <TableCell>{p.bestFor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </Section>

      <Section narrow>
        <PageHeader as="h2" title="Frequently asked questions" />
        <Accordion multiple collapsible>
          {FAQ.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionHeader as="h3" expandIconPosition="end">
                {item.q}
              </AccordionHeader>
              <AccordionPanel>
                <Body1 className={s.muted}>
                  {item.a}
                  {item.contact ? (
                    <>
                      {" "}
                      <Link href={site.contactUrl} target="_blank" rel="noopener noreferrer" inline>
                        Contact {site.company}
                      </Link>
                      .
                    </>
                  ) : null}
                </Body1>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <Section>
        <div className={s.band}>
          <Subtitle1 as="h2">Ready to start sending?</Subtitle1>
          <Body1 className={s.muted}>Set up {site.name} and send your first email in a few minutes.</Body1>
          <div className={s.bandActions}>
            <LinkButton href="/" appearance="primary" size="large">
              Get started
            </LinkButton>
            <LinkButton href={site.contactUrl} target="_blank" appearance="outline" size="large">
              Talk to {site.company}
            </LinkButton>
          </div>
        </div>
      </Section>
    </>
  );
}
