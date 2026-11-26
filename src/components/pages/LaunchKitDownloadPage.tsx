"use client";

import { Body1, Card, Divider, makeStyles, mergeClasses, Subtitle1, Title2, tokens } from "@fluentui/react-components";
import { CheckmarkCircle24Regular } from "@fluentui/react-icons";
import { launchKit } from "@/config/launch-kit";
import { site } from "@/config/site";
import BrandLogo from "../ui/BrandLogo";
import { AppLink } from "../ui/links";
import { Eyebrow } from "../ui/Layout";
import LaunchKitPrintButton from "../LaunchKitPrintButton";

export type LaunchKitGroup = { title: string; items: readonly string[] };

const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    padding: "24px 16px 48px",
    "@media (min-width: 768px)": { padding: "40px 24px 64px" },
    "@media print": { padding: 0, minHeight: "auto" },
  },
  article: {
    maxWidth: "880px",
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    padding: "24px",
    "@media (min-width: 768px)": { padding: "40px" },
    "@media print": { boxShadow: "none", padding: 0, maxWidth: "none" },
  },
  header: { display: "flex", flexDirection: "column", gap: "16px" },
  headRow: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    "@media (min-width: 640px)": { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  },
  headText: { display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 },
  muted: { color: tokens.colorNeutralForeground2 },
  subtle: { color: tokens.colorNeutralForeground3 },
  group: { display: "flex", flexDirection: "column", gap: "12px", breakInside: "avoid" },
  list: { listStyleType: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" },
  item: { display: "flex", gap: "12px", alignItems: "flex-start" },
  box: {
    flexShrink: 0,
    width: "18px",
    height: "18px",
    marginTop: "2px",
    borderRadius: tokens.borderRadiusSmall,
    border: `1.5px solid ${tokens.colorNeutralStroke1}`,
  },
  itemText: { minWidth: 0, overflowWrap: "anywhere", lineHeight: tokens.lineHeightBase400 },
  done: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "20px",
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorPaletteGreenBackground1,
    border: `1px solid ${tokens.colorPaletteGreenBorder1}`,
    breakInside: "avoid",
  },
  doneTitle: { display: "flex", alignItems: "center", gap: "8px", color: tokens.colorPaletteGreenForeground1 },
  footer: { display: "flex", flexWrap: "wrap", gap: "8px 16px" },
});

export default function LaunchKitDownloadPage({ groups }: { groups: readonly LaunchKitGroup[] }) {
  const s = useStyles();
  return (
    <main className={s.page}>
      <Card className={s.article}>
        <header className={s.header}>
          <div className="no-print">
            <BrandLogo />
          </div>
          <div className={s.headRow}>
            <div className={s.headText}>
              <Eyebrow>{site.name}</Eyebrow>
              <Title2 as="h1">{launchKit.name}</Title2>
              <Body1 className={s.muted}>
                A production checklist for launching {site.name} with Brevo or Amazon SES, authenticated sender domains,
                webhook events, and safe rollback coverage.
              </Body1>
            </div>
            <LaunchKitPrintButton />
          </div>
          <Body1 className={mergeClasses(s.subtle, "no-print")}>
            Bought the kit? Save this page as a PDF for your deployment runbook. Previewing first is fine too; the paid
            checkout is an optional way to support the project.
          </Body1>
        </header>

        <Divider />

        {groups.map((group) => (
          <section key={group.title} className={s.group}>
            <Subtitle1 as="h2">{group.title}</Subtitle1>
            <ul className={s.list}>
              {group.items.map((item) => (
                <li key={item} className={s.item}>
                  <span className={s.box} aria-hidden="true" />
                  <Body1 className={s.itemText}>{item}</Body1>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className={s.done}>
          <Subtitle1 as="h2" className={s.doneTitle}>
            <CheckmarkCircle24Regular aria-hidden="true" />
            Launch complete when
          </Subtitle1>
          <Body1>
            Production applications can send through {site.name}, authenticated headers pass, delivery events are
            logged, and rollback steps are documented for every migrated sender.
          </Body1>
        </section>

        <footer className={mergeClasses(s.footer, "no-print")}>
          <AppLink href={launchKit.productUrl}>Back to launch kit</AppLink>
          <AppLink href={launchKit.checkoutUrl} target="_blank">
            Buy the optional supporter kit
          </AppLink>
        </footer>
      </Card>
    </main>
  );
}
