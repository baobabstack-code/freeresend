"use client";

import Link from "next/link";
import { makeStyles, mergeClasses, Text, tokens } from "@fluentui/react-components";
import { site } from "@/config/site";

const useStyles = makeStyles({
  root: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    color: tokens.colorNeutralForeground1,
    minWidth: 0,
  },
  mark: {
    width: "36px",
    height: "36px",
    borderRadius: tokens.borderRadiusLarge,
    objectFit: "cover",
    flexShrink: 0,
    boxShadow: `0 0 0 1px ${tokens.colorNeutralStroke2}`,
  },
  markLarge: { width: "56px", height: "56px", borderRadius: tokens.borderRadiusXLarge },
  words: { display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 },
  name: { fontWeight: tokens.fontWeightBold, whiteSpace: "nowrap" },
  by: { color: tokens.colorNeutralForeground3, whiteSpace: "nowrap" },
});

export default function BrandLogo({
  href = "/",
  size = "medium",
  showByline = true,
  className,
}: {
  href?: string | null;
  size?: "medium" | "large";
  showByline?: boolean;
  className?: string;
}) {
  const styles = useStyles();
  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={site.logo}
        alt=""
        className={mergeClasses(styles.mark, size === "large" && styles.markLarge)}
      />
      <span className={styles.words}>
        <Text size={size === "large" ? 600 : 400} className={styles.name}>
          {site.name}
        </Text>
        {showByline ? (
          <Text size={200} className={styles.by}>
            by {site.company}
          </Text>
        ) : null}
      </span>
    </>
  );

  if (href === null) {
    return <span className={mergeClasses(styles.root, className)}>{content}</span>;
  }
  return (
    <Link href={href} className={mergeClasses(styles.root, className)} aria-label={`${site.name} home`}>
      {content}
    </Link>
  );
}
