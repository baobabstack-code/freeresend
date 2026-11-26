"use client";

import { useState } from "react";
import NextLink from "next/link";
import {
  Button,
  Caption1,
  Divider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Link,
  makeStyles,
  mergeClasses,
  Text,
  tokens,
} from "@fluentui/react-components";
import { Dismiss24Regular, Navigation24Regular } from "@fluentui/react-icons";
import BrandLogo from "./BrandLogo";
import { AppLink, LinkButton } from "./links";
import { Container } from "./Layout";
import { useAuth } from "@/contexts/AuthContext";
import { site } from "@/config/site";

export const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/tools/email-dns-checker", label: "DNS checker" },
  { href: "/guides/ses-production-readiness", label: "Guides" },
  { href: "/launch-kit", label: "Launch kit" },
] as const;

const useStyles = makeStyles({
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backdropFilter: "saturate(180%) blur(8px)",
  },
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    height: "64px",
  },
  nav: {
    display: "none",
    alignItems: "center",
    gap: "4px",
    "@media (min-width: 900px)": { display: "flex" },
  },
  navLink: {
    color: tokens.colorNeutralForeground2,
    textDecoration: "none",
    padding: "6px 10px",
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase300,
    ":hover": {
      color: tokens.colorNeutralForeground1,
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  actions: { display: "flex", alignItems: "center", gap: "8px" },
  desktopOnly: { display: "none", "@media (min-width: 900px)": { display: "inline-flex" } },
  mobileOnly: { "@media (min-width: 900px)": { display: "none" } },
  drawerLinks: { display: "flex", flexDirection: "column", gap: "4px" },
  drawerLink: {
    color: tokens.colorNeutralForeground1,
    textDecoration: "none",
    padding: "12px 8px",
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase400,
    ":hover": { backgroundColor: tokens.colorNeutralBackground1Hover },
  },
  footer: {
    marginTop: "auto",
    backgroundColor: tokens.colorNeutralBackground1,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingTop: "40px",
    paddingBottom: "32px",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "32px",
    "@media (min-width: 768px)": { gridTemplateColumns: "2fr 1fr 1fr 1fr" },
  },
  footerCol: { display: "flex", flexDirection: "column", gap: "8px" },
  footerHeading: { fontWeight: tokens.fontWeightSemibold },
  muted: { color: tokens.colorNeutralForeground3 },
  footerBottom: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "8px",
    marginTop: "32px",
  },
});

function NavLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <NextLink href={href} className={className}>
      {children}
    </NextLink>
  );
}

export function SiteHeader() {
  const s = useStyles();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const cta = (
    <LinkButton href={user ? "/" : "/login"} appearance="primary">
      {user ? "Dashboard" : "Login"}
    </LinkButton>
  );

  return (
    <header className={s.header}>
      <Container>
        <div className={s.bar}>
          <BrandLogo />
          <nav className={s.nav} aria-label="Main">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.href} href={l.href} className={s.navLink}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className={s.actions}>
            <span className={s.desktopOnly}>{cta}</span>
            <Button
              className={s.mobileOnly}
              appearance="subtle"
              icon={<Navigation24Regular />}
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            />
          </div>
        </div>
      </Container>

      <Drawer open={open} onOpenChange={(_, d) => setOpen(d.open)} position="end" size="small">
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close menu"
                icon={<Dismiss24Regular />}
                onClick={() => setOpen(false)}
              />
            }
          >
            Menu
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <nav className={s.drawerLinks} aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.href} href={l.href} className={s.drawerLink}>
                <span onClick={() => setOpen(false)}>{l.label}</span>
              </NavLink>
            ))}
            <Divider />
            <NavLink href={user ? "/" : "/login"} className={s.drawerLink}>
              <span onClick={() => setOpen(false)}>{user ? "Dashboard" : "Login"}</span>
            </NavLink>
          </nav>
        </DrawerBody>
      </Drawer>
    </header>
  );
}

export function SiteFooter() {
  const s = useStyles();
  const year = new Date().getFullYear();
  return (
    <footer className={mergeClasses(s.footer, "no-print")}>
      <Container>
        <div className={s.footerGrid}>
          <div className={s.footerCol}>
            <BrandLogo />
            <Text className={s.muted}>{site.tagline}. Send from your own domain with Brevo or Amazon SES.</Text>
          </div>
          <div className={s.footerCol}>
            <Text className={s.footerHeading}>Product</Text>
            <AppLink href="/pricing">Pricing</AppLink>
            <AppLink href="/launch-kit">Launch kit</AppLink>
            <AppLink href="/deployment-review">Deployment review</AppLink>
          </div>
          <div className={s.footerCol}>
            <Text className={s.footerHeading}>Resources</Text>
            <AppLink href="/tools/email-dns-checker">Email DNS checker</AppLink>
            <AppLink href="/guides/ses-production-readiness">SES production guide</AppLink>
            <AppLink href="/tools/ses-production-request-helper">SES request helper</AppLink>
          </div>
          <div className={s.footerCol}>
            <Text className={s.footerHeading}>{site.company}</Text>
            <Link href={site.companyUrl} target="_blank" rel="noopener noreferrer">
              baobabstack.co.zw
            </Link>
            <Link href={site.contactUrl} target="_blank" rel="noopener noreferrer">
              Contact
            </Link>
            <Link href={`mailto:${site.contactEmail}`}>{site.contactEmail}</Link>
          </div>
        </div>
        <div className={s.footerBottom}>
          <Caption1 className={s.muted}>
            © {year} {site.company}. All rights reserved.
          </Caption1>
          <Caption1 className={s.muted}>
            Built on the open-source{" "}
            <Link href={site.upstream.url} target="_blank" rel="noopener noreferrer" inline>
              {site.upstream.name}
            </Link>{" "}
            project (MIT licence).
          </Caption1>
        </div>
      </Container>
    </footer>
  );
}

/** Header + main + footer for public pages. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main style={{ flex: 1 }}>{children}</main>
      <SiteFooter />
    </>
  );
}
