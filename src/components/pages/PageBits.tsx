"use client";

import {
  Body1,
  Body2,
  Card,
  makeStyles,
  mergeClasses,
  Subtitle1,
  Text,
  Title1,
  Title3,
  tokens,
} from "@fluentui/react-components";
import { CheckmarkCircle20Filled } from "@fluentui/react-icons";
import { Container, Eyebrow } from "../ui/Layout";

const useStyles = makeStyles({
  hero: {
    paddingTop: "40px",
    paddingBottom: "40px",
    backgroundImage:
      "radial-gradient(circle at 10% 0%, rgba(245, 158, 11, 0.14), transparent 45%), radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.08), transparent 40%)",
    "@media (min-width: 768px)": { paddingTop: "64px", paddingBottom: "56px" },
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "32px",
    alignItems: "center",
    "@media (min-width: 1024px)": { gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)" },
  },
  heroText: { display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 },
  heroTitle: {
    fontSize: tokens.fontSizeHero800,
    lineHeight: tokens.lineHeightHero800,
    "@media (min-width: 768px)": { fontSize: tokens.fontSizeHero900, lineHeight: tokens.lineHeightHero900 },
  },
  lead: { color: tokens.colorNeutralForeground2, fontSize: tokens.fontSizeBase400, lineHeight: tokens.lineHeightBase500 },
  note: { color: tokens.colorNeutralForeground3 },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    "@media (min-width: 560px)": { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  },
  iconTile: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "44px",
    height: "44px",
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontSize: "24px",
  },
  iconTileWarning: {
    backgroundColor: tokens.colorPaletteYellowBackground1,
    color: tokens.colorPaletteMarigoldForeground2,
  },
  iconTileSuccess: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
  },
  featureCard: { display: "flex", flexDirection: "column", gap: "12px", padding: "20px", height: "100%" },
  muted: { color: tokens.colorNeutralForeground2 },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "16px",
  },
  grid2: { "@media (min-width: 768px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" } },
  grid3: { "@media (min-width: 768px)": { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" } },
  list: { listStyleType: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" },
  listItem: { display: "flex", gap: "10px", alignItems: "flex-start", minWidth: 0 },
  listIcon: { flexShrink: 0, marginTop: "1px", color: tokens.colorPaletteGreenForeground1, fontSize: "20px" },
  listText: { minWidth: 0, overflowWrap: "anywhere" },
  promo: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "20px",
    alignItems: "center",
    padding: "24px",
    borderRadius: tokens.borderRadiusXLarge,
    backgroundColor: tokens.colorBrandBackground2,
    border: `1px solid ${tokens.colorBrandStroke2}`,
    "@media (min-width: 900px)": { gridTemplateColumns: "minmax(0, 1fr) auto", padding: "32px" },
  },
  promoText: { display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 },
});

/** Hero block for public pages: eyebrow, the page h1, lead copy, actions and an optional aside. */
export function PageHero({
  eyebrow,
  title,
  lead,
  actions,
  note,
  aside,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  actions?: React.ReactNode;
  note?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const s = useStyles();
  return (
    <section className={s.hero}>
      <Container>
        <div className={s.heroGrid}>
          <div className={s.heroText}>
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
            <Title1 as="h1" className={s.heroTitle}>
              {title}
            </Title1>
            {lead ? <Text className={s.lead}>{lead}</Text> : null}
            {actions ? <ButtonRow>{actions}</ButtonRow> : null}
            {note ? <Body1 className={s.note}>{note}</Body1> : null}
          </div>
          {aside ? <div>{aside}</div> : null}
        </div>
      </Container>
    </section>
  );
}

export function ButtonRow({ children, className }: { children: React.ReactNode; className?: string }) {
  const s = useStyles();
  return <div className={mergeClasses(s.actions, className)}>{children}</div>;
}

export function IconTile({
  icon,
  tone = "brand",
}: {
  icon: React.ReactNode;
  tone?: "brand" | "warning" | "success";
}) {
  const s = useStyles();
  return (
    <span
      aria-hidden="true"
      className={mergeClasses(
        s.iconTile,
        tone === "warning" && s.iconTileWarning,
        tone === "success" && s.iconTileSuccess
      )}
    >
      {icon}
    </span>
  );
}

export function FeatureCard({
  icon,
  title,
  children,
  headingAs = "h2",
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
  headingAs?: "h2" | "h3";
}) {
  const s = useStyles();
  return (
    <Card className={s.featureCard}>
      {icon ? <IconTile icon={icon} /> : null}
      <Subtitle1 as={headingAs}>{title}</Subtitle1>
      {children}
    </Card>
  );
}

export function Muted({ children, className }: { children: React.ReactNode; className?: string }) {
  const s = useStyles();
  return <Body1 className={mergeClasses(s.muted, className)}>{children}</Body1>;
}

export function Grid({
  cols = 2,
  children,
  className,
}: {
  cols?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
}) {
  const s = useStyles();
  return (
    <div className={mergeClasses(s.grid, cols === 2 && s.grid2, cols === 3 && s.grid3, className)}>{children}</div>
  );
}

export function CheckList({
  items,
  icon,
  iconClassName,
}: {
  items: readonly React.ReactNode[];
  icon?: React.ReactNode;
  iconClassName?: string;
}) {
  const s = useStyles();
  return (
    <ul className={s.list}>
      {items.map((item, i) => (
        <li key={typeof item === "string" ? item : i} className={s.listItem}>
          <span aria-hidden="true" className={mergeClasses(s.listIcon, iconClassName)}>
            {icon ?? <CheckmarkCircle20Filled />}
          </span>
          <Body1 className={s.listText}>{item}</Body1>
        </li>
      ))}
    </ul>
  );
}

/** Highlighted call-to-action band. */
export function PromoBand({
  eyebrow,
  title,
  children,
  actions,
  headingAs = "h2",
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  headingAs?: "h2" | "h3";
}) {
  const s = useStyles();
  return (
    <div className={s.promo}>
      <div className={s.promoText}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Title3 as={headingAs}>{title}</Title3>
        {children ? <Body2 className={s.muted}>{children}</Body2> : null}
      </div>
      {actions ? <ButtonRow>{actions}</ButtonRow> : null}
    </div>
  );
}
