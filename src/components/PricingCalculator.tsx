"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Body1,
  Button,
  Caption1,
  Card,
  Divider,
  Field,
  Input,
  Link,
  makeStyles,
  mergeClasses,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Slider,
  Subtitle1,
  Subtitle2,
  Text,
  ToggleButton,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowTrendingDown24Regular,
  Calculator24Regular,
  Checkmark16Regular,
  Cloud24Regular,
  Money24Regular,
  Server24Regular,
  Settings20Regular,
} from "@fluentui/react-icons";
import {
  comparePricing,
  formatUSD,
  formatPercent,
  clampVolume,
  type PricingComparison,
} from "../lib/pricing-calculator";
import { site } from "@/config/site";
import WaitlistSignup from "./WaitlistSignup";

interface PricingCalculatorProps {
  className?: string;
  showAdvanced?: boolean;
  embeddable?: boolean;
  showWaitlist?: boolean;
}

const QUICK_PICK_VALUES = [
  { label: "3K", value: 3000 },
  { label: "4K", value: 4000 },
  { label: "5K", value: 5000 },
  { label: "10K", value: 10000 },
  { label: "20K", value: 20000 },
  { label: "30K", value: 30000 },
  { label: "50K", value: 50000 },
  { label: "100K", value: 100000 },
  { label: "200K", value: 200000 },
  { label: "500K", value: 500000 },
  { label: "1M", value: 1000000 },
];

const SLIDER_MAX = 2500000;

const STORAGE_KEYS = {
  VOLUME: "pricing-calculator-volume",
  FLAT_FEE: "pricing-calculator-flat-fee",
  SES_RATE: "pricing-calculator-ses-rate",
  HOSTING_COST: "pricing-calculator-hosting-cost",
  MAINTENANCE_COST: "pricing-calculator-maintenance-cost",
} as const;

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
    maxWidth: "1100px",
    marginLeft: "auto",
    marginRight: "auto",
    minWidth: 0,
  },
  panel: {
    padding: "20px",
    "@media (min-width: 768px)": { padding: "24px" },
  },
  stack: { display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 },
  volumeRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: "12px 16px",
  },
  volumeField: { flex: "1 1 220px", maxWidth: "320px" },
  muted: { color: tokens.colorNeutralForeground3 },
  sliderWrap: { display: "flex", flexDirection: "column", gap: "2px" },
  slider: { width: "100%" },
  ticks: {
    display: "flex",
    justifyContent: "space-between",
    color: tokens.colorNeutralForeground3,
    paddingLeft: "8px",
    paddingRight: "8px",
  },
  quickPicks: { display: "flex", flexWrap: "wrap", gap: "8px" },
  sectionHead: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  paramsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
    "@media (min-width: 600px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
    "@media (min-width: 1024px)": { gridTemplateColumns: "repeat(4, minmax(0, 1fr))" },
  },
  breakdown: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "16px",
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "12px",
    color: tokens.colorNeutralForeground2,
  },
  rowValue: {
    fontFamily: tokens.fontFamilyMonospace,
    whiteSpace: "nowrap",
    color: tokens.colorNeutralForeground1,
  },
  rowTotal: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
    "@media (min-width: 600px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
    "@media (min-width: 1024px)": { gridTemplateColumns: "repeat(4, minmax(0, 1fr))" },
  },
  resultCard: {
    padding: "20px",
    gap: "8px",
    minWidth: 0,
  },
  brandCard: {
    borderTop: `3px solid ${tokens.colorBrandStroke1}`,
  },
  successCard: {
    borderTop: `3px solid ${tokens.colorStatusSuccessBorder1}`,
    backgroundColor: tokens.colorStatusSuccessBackground1,
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
  cardIcon: { color: tokens.colorBrandForeground1, flexShrink: 0 },
  cardIconMuted: { color: tokens.colorNeutralForeground3, flexShrink: 0 },
  amount: {
    fontSize: tokens.fontSizeHero800,
    lineHeight: tokens.lineHeightHero800,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
    overflowWrap: "anywhere",
  },
  amountBrand: { color: tokens.colorBrandForeground1 },
  amountSuccess: { color: tokens.colorStatusSuccessForeground1 },
  amountMuted: {
    fontSize: tokens.fontSizeBase600,
    lineHeight: tokens.lineHeightBase600,
    color: tokens.colorNeutralForeground3,
  },
  details: { display: "flex", flexDirection: "column", gap: "4px", color: tokens.colorNeutralForeground3 },
  good: { color: tokens.colorStatusSuccessForeground1, fontWeight: tokens.fontWeightSemibold },
  warn: { color: tokens.colorStatusWarningForeground1 },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "24px",
    "@media (min-width: 768px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  },
  list: {
    margin: 0,
    paddingLeft: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: tokens.colorNeutralForeground2,
  },
  waitlistCard: {
    padding: 0,
    overflow: "hidden",
    border: `1px solid ${tokens.colorBrandStroke1}`,
  },
  waitlistHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "16px 20px",
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
});

/** Currency input that keeps the user's draft while typing and tidies it on blur. */
function MoneyField({
  label,
  hint,
  value,
  step,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(value.toFixed(2));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(value.toFixed(2));
  }, [value]);

  return (
    <Field label={label} hint={hint}>
      <Input
        type="number"
        contentBefore="$"
        value={draft}
        min={0}
        step={step}
        inputMode="decimal"
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
          setDraft(value.toFixed(2));
        }}
        onChange={(_, data) => {
          setDraft(data.value);
          onChange(Math.max(0, parseFloat(data.value) || 0));
        }}
      />
    </Field>
  );
}

function Row({ label, value, total }: { label: React.ReactNode; value: React.ReactNode; total?: boolean }) {
  const s = useStyles();
  return (
    <div className={mergeClasses(s.row, total && s.rowTotal)}>
      <span>{label}</span>
      <span className={s.rowValue}>{value}</span>
    </div>
  );
}

export default function PricingCalculator({
  className = "",
  showAdvanced = true,
  embeddable = false,
  showWaitlist = true,
}: PricingCalculatorProps) {
  const s = useStyles();

  const [volume, setVolume] = useState(50000);
  const [flatFee, setFlatFee] = useState(0.0);
  const [sesRate, setSesRate] = useState(0.1);
  const [hostingCost, setHostingCost] = useState(15.0);
  const [maintenanceCost, setMaintenanceCost] = useState(10.0);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  // Load saved values from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);
    const savedFlatFee = localStorage.getItem(STORAGE_KEYS.FLAT_FEE);
    const savedSesRate = localStorage.getItem(STORAGE_KEYS.SES_RATE);
    const savedHostingCost = localStorage.getItem(STORAGE_KEYS.HOSTING_COST);
    const savedMaintenanceCost = localStorage.getItem(STORAGE_KEYS.MAINTENANCE_COST);

    if (savedVolume) setVolume(clampVolume(parseInt(savedVolume, 10) || 0));

    // Migration: old platform fee defaults reset to $0 (open source, no platform fee)
    if (savedFlatFee) {
      const flatFeeValue = parseFloat(savedFlatFee);
      if (flatFeeValue === 5.0 || flatFeeValue === 9.0) {
        setFlatFee(0.0);
        localStorage.setItem(STORAGE_KEYS.FLAT_FEE, "0.00");
      } else {
        setFlatFee(flatFeeValue || 0);
      }
    }

    if (savedSesRate) setSesRate(parseFloat(savedSesRate) || 0);
    if (savedHostingCost) setHostingCost(parseFloat(savedHostingCost) || 0);
    if (savedMaintenanceCost) setMaintenanceCost(parseFloat(savedMaintenanceCost) || 0);

    setIsLoaded(true);
  }, []);

  // Persist values when they change
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
    localStorage.setItem(STORAGE_KEYS.FLAT_FEE, flatFee.toString());
    localStorage.setItem(STORAGE_KEYS.SES_RATE, sesRate.toString());
    localStorage.setItem(STORAGE_KEYS.HOSTING_COST, hostingCost.toString());
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_COST, maintenanceCost.toString());
  }, [volume, flatFee, sesRate, hostingCost, maintenanceCost, isLoaded]);

  const comparison = useMemo<PricingComparison>(
    () => comparePricing(volume, flatFee, sesRate, hostingCost, maintenanceCost),
    [volume, flatFee, sesRate, hostingCost, maintenanceCost]
  );

  const handleVolumeChange = (newVolume: number | string) => {
    const numValue = typeof newVolume === "string" ? parseInt(newVolume, 10) || 0 : newVolume;
    setVolume(clampVolume(numValue));
  };

  const formatVolume = (vol: number): string => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`;
    return vol.toString();
  };

  // Best savings option vs Resend
  const bestSavings = useMemo(() => {
    const none = { amount: null as number | null, percentage: null as number | null, option: "none" };
    if (comparison.resendCost === null || comparison.resendCost === 0) return none;

    const selfHostedSavings = comparison.savingsAbs || 0;
    const hostedSavings = comparison.hostedSavingsAbs || 0;

    if (selfHostedSavings > hostedSavings && selfHostedSavings > 0) {
      return { amount: selfHostedSavings, percentage: comparison.savingsPct, option: "self-hosted" };
    }
    if (hostedSavings > 0) {
      // Hosted wins, or ties (prefer hosted for simplicity)
      return { amount: hostedSavings, percentage: comparison.hostedSavingsPct, option: "hosted" };
    }
    return none;
  }, [comparison]);

  const hasSavings = bestSavings.amount !== null && bestSavings.amount > 0;
  const infrastructureCost =
    comparison.freeResendBreakdown.hostingCost + comparison.freeResendBreakdown.maintenanceCost;

  const scrollToWaitlist = () => {
    const el = document.querySelector("[data-waitlist-signup]");
    el?.scrollIntoView?.({ behavior: "smooth" });
  };

  return (
    <div className={mergeClasses(s.root, className)}>
      {/* Controls */}
      <Card className={s.panel}>
        <div className={s.stack}>
          <div className={s.volumeRow}>
            <Field label="Monthly email volume" className={s.volumeField}>
              <Input
                type="number"
                value={volume.toString()}
                onChange={(_, data) => handleVolumeChange(data.value)}
                min={0}
                max={5000000}
                step={1000}
                inputMode="numeric"
                contentAfter={<Text className={s.muted}>emails</Text>}
              />
            </Field>
            <Body1 className={s.muted} aria-live="polite">
              {formatVolume(volume)} emails/month
            </Body1>
          </div>

          <div className={s.sliderWrap}>
            <Slider
              className={s.slider}
              min={0}
              max={SLIDER_MAX}
              step={1000}
              value={Math.min(volume, SLIDER_MAX)}
              onChange={(_, data) => handleVolumeChange(data.value)}
              aria-label="Monthly email volume slider"
              aria-valuetext={`${volume.toLocaleString("en-US")} emails per month`}
            />
            <div className={s.ticks} aria-hidden="true">
              <Caption1>0</Caption1>
              <Caption1>1.25M</Caption1>
              <Caption1>2.5M</Caption1>
            </div>
          </div>

          <div className={s.quickPicks} role="group" aria-label="Quick volume picks">
            {QUICK_PICK_VALUES.map(({ label, value }) => (
              <ToggleButton
                key={value}
                size="small"
                shape="circular"
                checked={volume === value}
                appearance={volume === value ? "primary" : "outline"}
                onClick={() => handleVolumeChange(value)}
                aria-label={`Set volume to ${label}`}
              >
                {label}
              </ToggleButton>
            ))}
          </div>

          {showAdvanced && (
            <>
              <Divider />
              <div className={s.sectionHead}>
                <Subtitle2 as="h2">{site.name} cost settings</Subtitle2>
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Settings20Regular />}
                  aria-expanded={showDetails}
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? "Hide" : "Show"} breakdown
                </Button>
              </div>

              <div className={s.paramsGrid}>
                <MoneyField
                  label="Platform fee (optional)"
                  hint="$0 when you self-host the open-source app"
                  value={flatFee}
                  step={0.5}
                  onChange={setFlatFee}
                />
                <MoneyField
                  label="Sending rate per 1,000 emails"
                  hint="Amazon SES is about $0.10. Use $0 for Brevo's free plan."
                  value={sesRate}
                  step={0.01}
                  onChange={setSesRate}
                />
                <MoneyField
                  label="Hosting cost per month"
                  hint="Server and database"
                  value={hostingCost}
                  step={1}
                  onChange={setHostingCost}
                />
                <MoneyField
                  label="Maintenance cost per month"
                  hint="Updates, monitoring, backups"
                  value={maintenanceCost}
                  step={1}
                  onChange={setMaintenanceCost}
                />
              </div>

              {showDetails && (
                <div className={s.stack}>
                  <div className={s.breakdown}>
                    <Subtitle2 as="h3">Self-hosted cost breakdown</Subtitle2>
                    {comparison.freeResendBreakdown.flatFee > 0 && (
                      <Row label="Platform fee" value={formatUSD(comparison.freeResendBreakdown.flatFee)} />
                    )}
                    <Row
                      label={`Sending (${formatVolume(volume)} emails)`}
                      value={formatUSD(comparison.freeResendBreakdown.sesCost)}
                    />
                    <Row label="Hosting (server and database)" value={formatUSD(comparison.freeResendBreakdown.hostingCost)} />
                    <Row
                      label="Maintenance (updates and monitoring)"
                      value={formatUSD(comparison.freeResendBreakdown.maintenanceCost)}
                    />
                    <Divider />
                    <Row label="Total per month" value={formatUSD(comparison.freeResendBreakdown.totalCost)} total />
                  </div>
                  <MessageBar intent="info" layout="multiline">
                    <MessageBarBody>
                      <MessageBarTitle>Real-world costs included.</MessageBarTitle>
                      This estimate includes hosting and the time it takes to keep a production server
                      healthy, not just the per-email sending fee.
                    </MessageBarBody>
                  </MessageBar>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Results */}
      <section className={s.stack} aria-labelledby="pricing-results-heading">
        <Subtitle1 as="h2" id="pricing-results-heading">
          Your monthly cost
        </Subtitle1>
        <div className={s.cards}>
          {/* Resend */}
          <Card className={s.resultCard}>
            <div className={s.cardTitle}>
              <Money24Regular className={s.cardIconMuted} aria-hidden="true" />
              <Subtitle2 as="h3">Resend</Subtitle2>
            </div>
            {comparison.resendCost !== null ? (
              <Text className={s.amount}>{formatUSD(comparison.resendCost)}</Text>
            ) : (
              <Text className={mergeClasses(s.amount, s.amountMuted)}>Contact sales</Text>
            )}
            <div className={s.details}>
              <Caption1>{comparison.resendPlan}</Caption1>
              {comparison.resendNote && <Caption1>{comparison.resendNote}</Caption1>}
              {comparison.resendCost === 0 && <Caption1 className={s.good}>Free at this volume</Caption1>}
            </div>
          </Card>

          {/* Self-hosted */}
          <Card className={mergeClasses(s.resultCard, s.brandCard)}>
            <div className={s.cardTitle}>
              <Server24Regular className={s.cardIcon} aria-hidden="true" />
              <Subtitle2 as="h3">Self-hosted</Subtitle2>
            </div>
            <Text className={mergeClasses(s.amount, s.amountBrand)}>{formatUSD(comparison.freeResendCost)}</Text>
            <div className={s.details}>
              <Caption1>Includes hosting and maintenance</Caption1>
              <Caption1>Sending: {formatUSD(comparison.freeResendBreakdown.sesCost)}</Caption1>
              <Caption1>Infrastructure: {formatUSD(infrastructureCost)}</Caption1>
              {comparison.freeResendBreakdown.flatFee > 0 && (
                <Caption1>Platform: {formatUSD(comparison.freeResendBreakdown.flatFee)}</Caption1>
              )}
              {comparison.savingsAbs !== null && comparison.savingsAbs > 0 && (
                <Caption1 className={s.good}>Save {formatPercent(comparison.savingsPct!)} vs Resend</Caption1>
              )}
              {comparison.savingsAbs !== null && comparison.savingsAbs <= 0 && (
                <Caption1 className={s.warn}>The hosted option is better value at this volume</Caption1>
              )}
            </div>
          </Card>

          {/* Hosted */}
          <Card className={mergeClasses(s.resultCard, waitlistSuccess ? s.successCard : s.brandCard)}>
            <div className={s.cardTitle}>
              <Cloud24Regular className={s.cardIcon} aria-hidden="true" />
              <Subtitle2 as="h3">Hosted</Subtitle2>
              {waitlistSuccess ? (
                <Badge appearance="tint" color="success" icon={<Checkmark16Regular />}>
                  On waitlist
                </Badge>
              ) : (
                comparison.hostedTier.recommended && (
                  <Badge appearance="tint" color="brand">
                    Recommended
                  </Badge>
                )
              )}
            </div>
            <Text className={mergeClasses(s.amount, waitlistSuccess ? s.amountSuccess : s.amountBrand)}>
              {formatUSD(comparison.hostedCost)}
            </Text>
            <div className={s.details}>
              {volume <= comparison.hostedTier.includedEmails ? (
                <Caption1 className={s.good}>Free service + sending costs</Caption1>
              ) : (
                <Caption1>
                  $15 service fee + {formatUSD((volume / 1000) * sesRate)} sending
                </Caption1>
              )}
              {comparison.hostedSavingsAbs !== null && comparison.hostedSavingsAbs > 0 && (
                <Caption1 className={s.good}>
                  Save {formatPercent(comparison.hostedSavingsPct!)} vs Resend
                </Caption1>
              )}
              {comparison.hostedSavingsAbs !== null && comparison.hostedSavingsAbs < 0 && (
                <Caption1 className={s.warn}>
                  +{formatPercent(Math.abs(comparison.hostedSavingsPct!))} vs Resend
                </Caption1>
              )}
              {showWaitlist && !waitlistSuccess && !embeddable && (
                <Caption1>
                  <Link as="button" inline onClick={scrollToWaitlist}>
                    Join the waitlist
                  </Link>
                </Caption1>
              )}
              {waitlistSuccess && (
                <Caption1 className={s.good}>
                  You&apos;re on the waitlist! We&apos;ll notify you when it&apos;s ready.
                </Caption1>
              )}
            </div>
          </Card>

          {/* Best savings */}
          <Card className={s.resultCard}>
            <div className={s.cardTitle}>
              <ArrowTrendingDown24Regular
                className={hasSavings ? s.cardIcon : s.cardIconMuted}
                aria-hidden="true"
              />
              <Subtitle2 as="h3">Best savings</Subtitle2>
            </div>
            {bestSavings.amount !== null ? (
              <Text className={mergeClasses(s.amount, s.amountSuccess)}>{formatUSD(bestSavings.amount)}</Text>
            ) : (
              <Text className={mergeClasses(s.amount, s.amountMuted)}>N/A</Text>
            )}
            <div className={s.details}>
              {bestSavings.percentage !== null && bestSavings.option !== "none" ? (
                <>
                  <Caption1 className={s.good}>
                    {formatPercent(bestSavings.percentage)} with {bestSavings.option}
                  </Caption1>
                  {hasSavings && <Caption1>{formatUSD(bestSavings.amount!)} saved per month</Caption1>}
                </>
              ) : (
                <Caption1>No savings vs Resend</Caption1>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* Self-hosted reality check */}
      {!embeddable && (
        <Card className={s.panel}>
          <div className={s.stack}>
            <div className={s.cardTitle}>
              <Calculator24Regular className={s.cardIcon} aria-hidden="true" />
              <Subtitle1 as="h2">Self-hosting: the real costs</Subtitle1>
            </div>
            <div className={s.twoCol}>
              <div className={s.stack}>
                <Subtitle2 as="h3">What&apos;s included</Subtitle2>
                <div className={s.stack}>
                  <Row label="Server hosting (2–4 GB RAM)" value={`${formatUSD(hostingCost)}/mo`} />
                  <Row label="Managed PostgreSQL" value={`~${formatUSD(hostingCost * 0.6)}/mo`} />
                  <Row label="DevOps and maintenance" value={`${formatUSD(maintenanceCost)}/mo`} />
                  <Row label="Monitoring and backups" value={`~${formatUSD(5)}/mo`} />
                  <Row label="SSL and security updates" value="Your time" />
                  <Divider />
                  <Row label="Infrastructure total" value={`${formatUSD(hostingCost + maintenanceCost)}/mo`} total />
                  <Row label="Platform fee (open source)" value="Free" total />
                </div>
              </div>
              <div className={s.stack}>
                <Subtitle2 as="h3">Hidden costs to consider</Subtitle2>
                <ul className={s.list}>
                  <li>
                    <strong>Setup time:</strong> 4–8 hours for the first deployment and configuration
                  </li>
                  <li>
                    <strong>Security updates:</strong> monthly patches and dependency updates
                  </li>
                  <li>
                    <strong>Monitoring:</strong> alerts, log management and uptime checks
                  </li>
                  <li>
                    <strong>Backups:</strong> database backups and a disaster-recovery plan
                  </li>
                  <li>
                    <strong>Scaling:</strong> performance tuning as your volume grows
                  </li>
                </ul>
                <MessageBar intent="warning" layout="multiline">
                  <MessageBarBody>
                    <MessageBarTitle>Reality check.</MessageBarTitle>
                    Many &quot;self-hosted savings&quot; calculators show only the sending fees (
                    {formatUSD(comparison.freeResendBreakdown.sesCost)}) and leave out the{" "}
                    {formatUSD(hostingCost + maintenanceCost)} in infrastructure and time. This
                    calculator includes both.
                  </MessageBarBody>
                </MessageBar>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Hosted plan */}
      {!embeddable && (
        <Card className={s.panel}>
          <div className={s.stack}>
            <div className={s.cardTitle}>
              <Cloud24Regular className={s.cardIcon} aria-hidden="true" />
              <Subtitle1 as="h2">
                Hosted version: {site.name} {comparison.hostedTier.name}
              </Subtitle1>
              {comparison.hostedTier.recommended && (
                <Badge appearance="tint" color="brand">
                  Recommended
                </Badge>
              )}
            </div>

            <div className={s.twoCol}>
              <div className={s.stack}>
                <Subtitle2 as="h3">Pricing breakdown</Subtitle2>
                <div className={s.stack}>
                  <Row label="First 3,000 emails" value="Free" />
                  <Row label="After 3,000 emails" value="$15/month flat" />
                  <Row label="Sending costs" value="Paid to your provider" />
                </div>
                <Caption1 className={s.muted}>
                  Send through Brevo&apos;s free plan (about 300 emails a day, no card needed) or Amazon
                  SES (pay per use, about $0.10 per 1,000 emails).
                </Caption1>
                <MessageBar
                  intent={volume > comparison.hostedTier.includedEmails ? "info" : "success"}
                  layout="multiline"
                >
                  <MessageBarBody>
                    {volume > comparison.hostedTier.includedEmails
                      ? "Your cost: $15/month service fee + sending costs"
                      : "Your cost: no service fee, sending costs only"}
                  </MessageBarBody>
                </MessageBar>
              </div>

              <div className={s.stack}>
                <Subtitle2 as="h3">Features</Subtitle2>
                <ul className={s.list}>
                  {comparison.hostedTier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>

            {showWaitlist ? (
              <Card className={s.waitlistCard} data-waitlist-signup>
                <div className={s.waitlistHeader}>
                  <Subtitle2 as="h3">Get early access to the hosted version</Subtitle2>
                  <Caption1>Join the waitlist and be the first to know when it launches</Caption1>
                </div>
                <WaitlistSignup
                  estimatedVolume={volume}
                  compact={true}
                  trackingContext="pricing-calculator"
                  onSuccess={() => {
                    setWaitlistSuccess(true);
                    if (typeof window !== "undefined" && window.gtag) {
                      window.gtag("event", "waitlist_signup_from_calculator", {
                        volume,
                        tier: comparison.hostedTier.name,
                        hosted_cost: comparison.hostedCost,
                        self_hosted_cost: comparison.freeResendCost,
                        resend_cost: comparison.resendCost,
                      });
                    }
                  }}
                />
              </Card>
            ) : (
              <MessageBar intent="info" layout="multiline">
                <MessageBarBody>
                  <MessageBarTitle>Coming soon</MessageBarTitle>
                  Hosted {site.name} is in development. We&apos;ll share early-access pricing with
                  waitlist members first.
                </MessageBarBody>
              </MessageBar>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// Export calculation functions and types for external use
export {
  comparePricing,
  formatUSD,
  formatPercent,
  HOSTED_PRICING_TIERS,
  getBestHostedTier,
  getHostedCost,
  getFreeResendHostedCost,
} from "../lib/pricing-calculator";
export type { HostedPricingTier, HostedQuote } from "../lib/pricing-calculator";
