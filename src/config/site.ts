/** Product identity for Baobab Mail (by Baobab Stack). */
export const site = {
  name: "Baobab Mail",
  company: "Baobab Stack",
  tagline: "Transactional email API by Baobab Stack",
  description:
    "Baobab Mail is a Resend-compatible transactional email API by Baobab Stack. Send from your own domain through Brevo or Amazon SES, with automatic DNS setup, delivery tracking and API keys per domain.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://mail.baobabstack.co.zw").replace(/\/$/, ""),
  companyUrl: "https://www.baobabstack.co.zw",
  contactUrl: "https://www.baobabstack.co.zw/contact",
  contactEmail: "baobabstack@gmail.com",
  logo: "/brand/baobab-mark.png",
  /** Upstream open-source project this product is built on (MIT licence). */
  upstream: {
    name: "FreeResend",
    url: "https://github.com/eibrahim/freeresend",
  },
  defaultFromEmail: "noreply@mail.baobabstack.co.zw",
} as const;

export function absoluteUrl(path = "/"): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
