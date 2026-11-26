import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import { site } from "@/config/site";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords:
    "transactional email api, resend alternative, brevo, amazon ses, email api zimbabwe, baobab stack",
  authors: [{ name: site.company, url: site.companyUrl }],
  creator: site.company,
  publisher: site.company,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    images: [{ url: "/brand/baobab-mark-1024.jpg", width: 1024, height: 1024 }],
  },
  twitter: {
    card: "summary",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f17" },
  ],
};

const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC;
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {umamiSrc && umamiWebsiteId ? (
          <Script defer src={umamiSrc} data-website-id={umamiWebsiteId} />
        ) : null}
      </head>
      <body className={`${roboto.variable} ${robotoMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
