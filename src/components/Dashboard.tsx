"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Caption1,
  makeStyles,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Tab,
  TabList,
  Text,
  tokens,
  Tooltip,
} from "@fluentui/react-components";
import {
  DocumentBulletList24Regular,
  Globe24Regular,
  Key24Regular,
  Open16Regular,
  SignOut20Regular,
} from "@fluentui/react-icons";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { site } from "@/config/site";
import BrandLogo from "./ui/BrandLogo";
import { Container } from "./ui/Layout";
import DomainsTab, { type ProviderInfo } from "./DomainsTab";
import ApiKeysTab from "./ApiKeysTab";
import EmailLogsTab from "./EmailLogsTab";

type TabKey = "domains" | "apikeys" | "logs";

const useStyles = makeStyles({
  header: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    minHeight: "64px",
  },
  right: { display: "flex", alignItems: "center", gap: "12px", minWidth: 0 },
  providerBadge: { display: "none", "@media (min-width: 600px)": { display: "inline-flex" } },
  tabs: { overflowX: "auto", marginLeft: "-8px" },
  main: { flex: 1, paddingTop: "24px", paddingBottom: "48px" },
  footer: {
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingTop: "16px",
    paddingBottom: "24px",
    color: tokens.colorNeutralForeground3,
  },
  footerRow: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "8px" },
  footerLink: { color: "inherit" },
  userButton: { minWidth: 0, maxWidth: "260px" },
  email: {
    display: "none",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    "@media (min-width: 600px)": { display: "inline" },
  },
});

export default function Dashboard() {
  const s = useStyles();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<TabKey>("domains");
  const [provider, setProvider] = useState<ProviderInfo | null>(null);

  useEffect(() => {
    api
      .getProvider()
      .then((r) => setProvider(r.data))
      .catch(() => setProvider(null));
  }, []);

  return (
    <>
      <header className={s.header}>
        <Container>
          <div className={s.bar}>
            <BrandLogo href="/" />
            <div className={s.right}>
              {provider ? (
                <Tooltip content={`Emails are sent through ${provider.label}`} relationship="description">
                  <Badge className={s.providerBadge} appearance="outline" color="brand" shape="rounded">
                    {provider.label}
                  </Badge>
                </Tooltip>
              ) : null}
              <Menu positioning="below-end">
                <MenuTrigger disableButtonEnhancement>
                  <Button
                    appearance="subtle"
                    className={s.userButton}
                    icon={<Avatar name={user?.email} size={28} color="colorful" />}
                    aria-label="Account menu"
                  >
                    <span className={s.email}>{user?.email}</span>
                  </Button>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem icon={<SignOut20Regular />} onClick={logout}>
                      Sign out
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            </div>
          </div>
          <TabList
            className={s.tabs}
            selectedValue={tab}
            onTabSelect={(_, d) => setTab(d.value as TabKey)}
            aria-label="Dashboard sections"
          >
            <Tab value="domains" icon={<Globe24Regular />}>
              Domains
            </Tab>
            <Tab value="apikeys" icon={<Key24Regular />}>
              API keys
            </Tab>
            <Tab value="logs" icon={<DocumentBulletList24Regular />}>
              Email logs
            </Tab>
          </TabList>
        </Container>
      </header>

      <main className={s.main}>
        <Container>
          {tab === "domains" && <DomainsTab provider={provider} />}
          {tab === "apikeys" && <ApiKeysTab />}
          {tab === "logs" && <EmailLogsTab />}
        </Container>
      </main>

      <footer className={s.footer}>
        <Container>
          <div className={s.footerRow}>
            <Caption1>
              {site.name} · {site.tagline}
            </Caption1>
            <Text size={200}>
              <a className={s.footerLink} href={site.companyUrl} target="_blank" rel="noopener noreferrer">
                {site.company} <Open16Regular style={{ verticalAlign: "middle" }} />
              </a>
            </Text>
          </div>
        </Container>
      </footer>
    </>
  );
}
