"use client";

import { Badge, type BadgeProps } from "@fluentui/react-components";

type Color = NonNullable<BadgeProps["color"]>;

const COLORS: Record<string, Color> = {
  verified: "success",
  delivered: "success",
  sent: "brand",
  pending: "warning",
  failed: "danger",
  bounced: "danger",
  complained: "severe",
};

const LABELS: Record<string, string> = {
  complained: "spam complaint",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <Badge appearance="tint" color={COLORS[status] ?? "informative"} shape="rounded">
      {LABELS[status] ?? status}
    </Badge>
  );
}
