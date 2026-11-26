"use client";

import { Badge, Body1, Card, makeStyles, mergeClasses, Title2, Title3, tokens } from "@fluentui/react-components";
import { ArrowRight16Regular, Open16Regular } from "@fluentui/react-icons";
import { LinkButton } from "../ui/links";
import { ButtonRow, CheckList } from "./PageBits";

const useStyles = makeStyles({
  card: { padding: "24px", "@media (min-width: 768px)": { padding: "32px" } },
  compactCard: { padding: "24px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "24px",
    alignItems: "center",
    "@media (min-width: 1024px)": { gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.8fr)", gap: "32px" },
  },
  stack: { display: "flex", flexDirection: "column", gap: "20px" },
  text: { display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start", minWidth: 0 },
  side: { display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 },
  muted: { color: tokens.colorNeutralForeground2 },
});

/** Shared layout for the launch kit and deployment review calls to action. */
export default function OfferCta({
  compact,
  badgeIcon,
  badge,
  title,
  description,
  bullets,
  checkoutUrl,
  buyLabel,
  moreUrl,
  moreLabel,
}: {
  compact: boolean;
  badgeIcon: React.ReactElement;
  badge: string;
  title: string;
  description: React.ReactNode;
  bullets: readonly string[];
  checkoutUrl: string;
  buyLabel: string;
  moreUrl: string;
  moreLabel: string;
}) {
  const s = useStyles();
  const Heading = compact ? Title3 : Title2;
  return (
    <Card className={compact ? s.compactCard : s.card}>
      <div className={mergeClasses(compact ? s.stack : s.grid)}>
        <div className={s.text}>
          <Badge appearance="tint" color="brand" icon={badgeIcon} size="large">
            {badge}
          </Badge>
          <Heading as="h2">{title}</Heading>
          <Body1 className={s.muted}>{description}</Body1>
        </div>
        <div className={s.side}>
          <CheckList items={compact ? bullets.slice(0, 3) : bullets} />
          <ButtonRow>
            <LinkButton
              href={checkoutUrl}
              target="_blank"
              appearance="primary"
              icon={<Open16Regular />}
              iconPosition="after"
            >
              {buyLabel}
            </LinkButton>
            <LinkButton href={moreUrl} icon={<ArrowRight16Regular />} iconPosition="after">
              {moreLabel}
            </LinkButton>
          </ButtonRow>
        </div>
      </div>
    </Card>
  );
}
