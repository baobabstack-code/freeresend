"use client";

import {
  Body1,
  Card,
  makeStyles,
  mergeClasses,
  Text,
  Title2,
  tokens,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  container: {
    width: "100%",
    maxWidth: "1200px",
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: "16px",
    paddingRight: "16px",
    "@media (min-width: 768px)": { paddingLeft: "24px", paddingRight: "24px" },
  },
  narrow: { maxWidth: "880px" },
  section: {
    paddingTop: "48px",
    paddingBottom: "48px",
    "@media (min-width: 768px)": { paddingTop: "72px", paddingBottom: "72px" },
  },
  sectionAlt: { backgroundColor: tokens.colorNeutralBackground1 },
  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "24px",
  },
  headerText: { display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: "1 1 320px" },
  description: { color: tokens.colorNeutralForeground3 },
  actions: { display: "flex", gap: "8px", flexWrap: "wrap" },
  card: { padding: "20px", "@media (min-width: 768px)": { padding: "24px" } },
  eyebrow: {
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
});

export function Container({
  children,
  narrow,
  className,
}: {
  children: React.ReactNode;
  narrow?: boolean;
  className?: string;
}) {
  const s = useStyles();
  return <div className={mergeClasses(s.container, narrow && s.narrow, className)}>{children}</div>;
}

export function Section({
  children,
  alt,
  narrow,
  id,
  className,
}: {
  children: React.ReactNode;
  alt?: boolean;
  narrow?: boolean;
  id?: string;
  className?: string;
}) {
  const s = useStyles();
  return (
    <section id={id} className={mergeClasses(s.section, alt && s.sectionAlt, className)}>
      <Container narrow={narrow}>{children}</Container>
    </section>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  as = "h1",
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  as?: "h1" | "h2";
}) {
  const s = useStyles();
  return (
    <div className={s.header}>
      <div className={s.headerText}>
        <Title2 as={as}>{title}</Title2>
        {description ? <Body1 className={s.description}>{description}</Body1> : null}
      </div>
      {actions ? <div className={s.actions}>{actions}</div> : null}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  const s = useStyles();
  return (
    <Text size={200} className={s.eyebrow}>
      {children}
    </Text>
  );
}

export function PanelCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const s = useStyles();
  return <Card className={mergeClasses(s.card, className)}>{children}</Card>;
}
