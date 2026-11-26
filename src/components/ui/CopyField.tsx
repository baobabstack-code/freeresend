"use client";

import { useState } from "react";
import {
  Button,
  Caption1,
  makeStyles,
  mergeClasses,
  tokens,
  Tooltip,
} from "@fluentui/react-components";
import { Checkmark16Regular, Copy16Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  root: { display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 },
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: "4px",
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "6px 6px 6px 10px",
    minWidth: 0,
  },
  value: {
    flex: 1,
    minWidth: 0,
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase300,
    paddingTop: "3px",
    overflowWrap: "anywhere",
    wordBreak: "break-all",
    whiteSpace: "pre-wrap",
    color: tokens.colorNeutralForeground1,
  },
  masked: { letterSpacing: "0.1em" },
  label: { color: tokens.colorNeutralForeground3 },
});

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export default function CopyField({
  label,
  value,
  mask = false,
  className,
}: {
  label?: string;
  value: string;
  mask?: boolean;
  className?: string;
}) {
  const s = useStyles();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (await copyText(value)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className={mergeClasses(s.root, className)}>
      {label ? <Caption1 className={s.label}>{label}</Caption1> : null}
      <div className={s.row}>
        <code className={mergeClasses(s.value, mask && s.masked)}>
          {mask ? "•".repeat(Math.min(value.length, 24)) : value}
        </code>
        <Tooltip content={copied ? "Copied" : `Copy${label ? ` ${label.toLowerCase()}` : ""}`} relationship="label">
          <Button
            size="small"
            appearance="subtle"
            icon={copied ? <Checkmark16Regular /> : <Copy16Regular />}
            onClick={onCopy}
          />
        </Tooltip>
      </div>
    </div>
  );
}
