import {
  createDarkTheme,
  createLightTheme,
  type BrandVariants,
  type Theme,
} from "@fluentui/react-components";

/**
 * Baobab Stack amber ramp (primary #f59e0b, matches baobabstack.co.zw).
 * 10 = darkest, 160 = lightest.
 */
export const baobabBrand: BrandVariants = {
  10: "#1a0d00",
  20: "#2b1600",
  30: "#451a03",
  40: "#5c2405",
  50: "#78350f",
  60: "#92400e",
  70: "#b45309",
  80: "#d97706",
  90: "#f59e0b",
  100: "#fbbf24",
  110: "#fcd34d",
  120: "#fde68a",
  130: "#fef3c7",
  140: "#fffbeb",
  150: "#fffdf5",
  160: "#fffefa",
};

/** Brand palette shared with the main site's MUI theme. */
export const brandColors = {
  amber: "#f59e0b",
  amberLight: "#fbbf24",
  amberDark: "#d97706",
  emerald: "#10b981",
  cyan: "#06b6d4",
  ink: "#090d16",
  night: "#0b0f17",
  nightPaper: "#111827",
} as const;

const fonts = {
  fontFamilyBase:
    'var(--font-roboto), "Roboto", "Segoe UI", system-ui, -apple-system, sans-serif',
  fontFamilyMonospace:
    'var(--font-roboto-mono), "Roboto Mono", ui-monospace, Consolas, monospace',
  fontFamilyNumeric:
    'var(--font-roboto), "Roboto", "Segoe UI", system-ui, sans-serif',
};

const radii = {
  borderRadiusMedium: "6px",
  borderRadiusLarge: "8px",
  borderRadiusXLarge: "12px",
};

/** Amber buttons carry dark ink text, like the main site (contrast ≥ 7:1). */
const onBrand = {
  colorNeutralForegroundOnBrand: brandColors.ink,
  colorBrandBackground: brandColors.amber,
  colorBrandBackgroundHover: brandColors.amberDark,
  colorBrandBackgroundPressed: "#b45309",
  colorBrandBackgroundSelected: brandColors.amberDark,
};

export const baobabLightTheme: Theme = {
  ...createLightTheme(baobabBrand),
  ...fonts,
  ...radii,
  ...onBrand,
  // Amber text on white needs the darker shades to pass WCAG AA.
  colorBrandForeground1: "#b45309",
  colorBrandForeground2: "#92400e",
  colorBrandForegroundLink: "#b45309",
  colorBrandForegroundLinkHover: "#92400e",
  colorBrandForegroundLinkPressed: "#78350f",
  colorBrandStroke1: "#d97706",
  colorCompoundBrandBackground: "#d97706",
  colorCompoundBrandBackgroundHover: "#b45309",
  colorCompoundBrandStroke: "#d97706",
};

export const baobabDarkTheme: Theme = {
  ...createDarkTheme(baobabBrand),
  ...fonts,
  ...radii,
  ...onBrand,
  colorBrandBackgroundHover: brandColors.amberLight,
  colorBrandBackgroundPressed: brandColors.amberDark,
  colorBrandForeground1: brandColors.amberLight,
  colorBrandForeground2: "#fcd34d",
  colorBrandForegroundLink: brandColors.amberLight,
  colorBrandForegroundLinkHover: "#fcd34d",
  colorBrandForegroundLinkPressed: brandColors.amber,
  colorCompoundBrandBackground: brandColors.amber,
  colorCompoundBrandStroke: brandColors.amber,
  // Night surfaces from baobabstack.co.zw
  colorNeutralBackground1: brandColors.nightPaper,
  colorNeutralBackground1Hover: "#1a2332",
  colorNeutralBackground1Pressed: "#0f1520",
  colorNeutralBackground1Selected: "#1f2937",
  colorNeutralBackground2: brandColors.night,
  colorNeutralBackground2Hover: "#121826",
  colorNeutralBackground3: "#0e131d",
  colorNeutralBackground4: "#0a0e15",
  colorNeutralForeground1: "#f1f5f9",
  colorNeutralForeground2: "#cbd5e1",
  colorNeutralForeground3: "#94a3b8",
  colorNeutralStroke1: "#334155",
  colorNeutralStroke2: "#1f2937",
  colorNeutralStroke3: "#1a2230",
};
