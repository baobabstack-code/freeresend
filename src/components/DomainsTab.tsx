"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Body1,
  Button,
  Caption1,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  Input,
  makeStyles,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  Subtitle2,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  tokens,
} from "@fluentui/react-components";
import {
  Add20Regular,
  ArrowSync20Regular,
  CheckmarkCircle20Regular,
  Delete20Regular,
  Globe20Regular,
  Mail20Regular,
  MoreHorizontal20Regular,
  TextBulletListSquare20Regular,
} from "@fluentui/react-icons";
import { api } from "@/lib/api";
import { PageHeader, PanelCard } from "./ui/Layout";
import StatusBadge from "./ui/StatusBadge";
import CopyField from "./ui/CopyField";
import ConfirmDialog from "./ui/ConfirmDialog";
import { errorMessage, useNotify } from "./ui/toast";

export interface ProviderInfo {
  name: "ses" | "brevo";
  label: string;
  smtpMode: "per-domain" | "shared";
}

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number;
  description?: string;
}

interface SmtpCredentials {
  username: string;
  password: string;
  server: string;
  port: number;
  shared?: boolean;
}

interface Domain {
  id: string;
  domain: string;
  status: "pending" | "verified" | "failed";
  provider?: string;
  dns_records: DnsRecord[];
  smtp_credentials?: SmtpCredentials;
  created_at: string;
}

const useStyles = makeStyles({
  addForm: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: "12px",
  },
  addField: { flex: "1 1 280px" },
  tableCard: { padding: 0, overflow: "hidden" },
  tableWrap: { overflowX: "auto" },
  table: { minWidth: "640px" },
  domainName: { fontWeight: tokens.fontWeightSemibold },
  muted: { color: tokens.colorNeutralForeground3 },
  actionsCell: { display: "flex", justifyContent: "flex-end", gap: "4px" },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "8px",
    padding: "48px 16px",
    color: tokens.colorNeutralForeground3,
  },
  emptyIcon: { fontSize: "40px", color: tokens.colorBrandForeground1 },
  stack: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" },
  record: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "14px",
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  recordHead: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  dialogSurface: { maxWidth: "720px", width: "calc(100vw - 32px)" },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
    "@media (min-width: 560px)": { gridTemplateColumns: "1fr 1fr" },
  },
  loading: { padding: "48px" },
});

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DomainsTab({ provider }: { provider?: ProviderInfo | null }) {
  const s = useStyles();
  const notify = useNotify();

  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [dnsDomain, setDnsDomain] = useState<Domain | null>(null);
  const [smtp, setSmtp] = useState<{ domain: Domain; credentials: SmtpCredentials } | null>(null);
  const [toDelete, setToDelete] = useState<Domain | null>(null);
  const [smtpToDelete, setSmtpToDelete] = useState<Domain | null>(null);

  const providerLabel = provider?.label ?? "your email provider";

  const load = useCallback(async () => {
    try {
      const response = await api.getDomains();
      setDomains(response.data.domains);
    } catch (error) {
      notify.error("Couldn't load domains", errorMessage(error));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const replaceDomain = (updated: Partial<Domain> & { id: string }) => {
    setDomains((list) => list.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)));
    setDnsDomain((d) => (d && d.id === updated.id ? { ...d, ...updated } : d));
  };

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = newDomain.trim().toLowerCase();
    if (!value) return;
    setAdding(true);
    try {
      const response = await api.addDomain(value);
      const domain: Domain = response.data.domain;
      setDomains((list) => [domain, ...list.filter((d) => d.id !== domain.id)]);
      setNewDomain("");
      setDnsDomain(domain);
      notify.success("Domain added", "Add the DNS records below, then click Verify.");
    } catch (error) {
      notify.error("Couldn't add domain", errorMessage(error));
    } finally {
      setAdding(false);
    }
  };

  const verify = async (domain: Domain) => {
    setBusyId(domain.id);
    try {
      const response = await api.verifyDomain(domain.id);
      replaceDomain({ id: domain.id, status: response.data.status });
      if (response.data.verified) notify.success("Domain verified", `${domain.domain} is ready to send.`);
      else notify.info("Not verified yet", "DNS changes can take up to an hour to show up. Try again shortly.");
    } catch (error) {
      notify.error("Verification failed", errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const refreshDns = async (domain: Domain) => {
    setBusyId(domain.id);
    try {
      const response = await api.retryDigitalOceanDNS(domain.id);
      if (response.data?.dnsRecords) replaceDomain({ id: domain.id, dns_records: response.data.dnsRecords });
      notify.success("DNS records synced", response.message);
    } catch (error) {
      // Records are still refreshed even when DigitalOcean isn't used.
      await load();
      notify.warning("Records refreshed", errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusyId(toDelete.id);
    try {
      await api.deleteDomain(toDelete.id);
      setDomains((list) => list.filter((d) => d.id !== toDelete.id));
      notify.success("Domain deleted", `${toDelete.domain} and its API keys were removed.`);
      setToDelete(null);
    } catch (error) {
      notify.error("Couldn't delete domain", errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const openSmtp = async (domain: Domain) => {
    if (domain.smtp_credentials) {
      setSmtp({ domain, credentials: domain.smtp_credentials });
      return;
    }
    setBusyId(domain.id);
    try {
      const response = await api.createSmtpCredentials(domain.id);
      const credentials: SmtpCredentials = response.credentials;
      if (!credentials.shared) replaceDomain({ id: domain.id, smtp_credentials: credentials });
      setSmtp({ domain, credentials });
    } catch (error) {
      notify.error("SMTP unavailable", errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const deleteSmtp = async () => {
    if (!smtpToDelete) return;
    setBusyId(smtpToDelete.id);
    try {
      await api.deleteSmtpCredentials(smtpToDelete.id);
      replaceDomain({ id: smtpToDelete.id, smtp_credentials: undefined });
      setSmtp(null);
      setSmtpToDelete(null);
      notify.success("SMTP credentials deleted");
    } catch (error) {
      notify.error("Couldn't delete SMTP credentials", errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Domains"
        description={`Add the domains you send from. ${provider ? `${provider.label} signs your email` : "Your provider signs your email"} once the DNS records are in place.`}
      />

      <PanelCard>
        <form className={s.addForm} onSubmit={addDomain}>
          <Field label="Domain name" className={s.addField} hint="For example mail.yourcompany.co.zw">
            <Input
              value={newDomain}
              onChange={(_, d) => setNewDomain(d.value)}
              placeholder="example.com"
              contentBefore={<Globe20Regular />}
              disabled={adding}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
          <Button
            type="submit"
            appearance="primary"
            icon={adding ? <Spinner size="tiny" /> : <Add20Regular />}
            disabled={adding || !newDomain.trim()}
          >
            {adding ? "Adding…" : "Add domain"}
          </Button>
        </form>
      </PanelCard>

      <div style={{ height: 16 }} />

      <PanelCard className={s.tableCard}>
        {loading ? (
          <Spinner className={s.loading} label="Loading domains…" />
        ) : domains.length === 0 ? (
          <div className={s.empty}>
            <Globe20Regular className={s.emptyIcon} />
            <Subtitle2>No domains yet</Subtitle2>
            <Body1>Add your first domain above to start sending email.</Body1>
          </div>
        ) : (
          <div className={s.tableWrap}>
            <Table className={s.table} aria-label="Domains">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Domain</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Added</TableHeaderCell>
                  <TableHeaderCell aria-label="Actions" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain) => {
                  const busy = busyId === domain.id;
                  return (
                    <TableRow key={domain.id}>
                      <TableCell>
                        <TableCellLayout
                          media={<Globe20Regular />}
                          description={
                            domain.provider && provider && domain.provider !== provider.name
                              ? `Set up with ${domain.provider === "brevo" ? "Brevo" : "Amazon SES"}`
                              : undefined
                          }
                        >
                          <span className={s.domainName}>{domain.domain}</span>
                        </TableCellLayout>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={domain.status} />
                      </TableCell>
                      <TableCell>
                        <Text className={s.muted}>{formatDate(domain.created_at)}</Text>
                      </TableCell>
                      <TableCell>
                        <div className={s.actionsCell}>
                          {busy ? <Spinner size="tiny" /> : null}
                          {domain.status !== "verified" ? (
                            <Button
                              size="small"
                              appearance="primary"
                              icon={<CheckmarkCircle20Regular />}
                              onClick={() => verify(domain)}
                              disabled={busy}
                            >
                              Verify
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              icon={<Mail20Regular />}
                              onClick={() => openSmtp(domain)}
                              disabled={busy}
                            >
                              SMTP
                            </Button>
                          )}
                          <Menu positioning="below-end">
                            <MenuTrigger disableButtonEnhancement>
                              <Button
                                size="small"
                                appearance="subtle"
                                icon={<MoreHorizontal20Regular />}
                                aria-label={`More actions for ${domain.domain}`}
                                disabled={busy}
                              />
                            </MenuTrigger>
                            <MenuPopover>
                              <MenuList>
                                <MenuItem icon={<TextBulletListSquare20Regular />} onClick={() => setDnsDomain(domain)}>
                                  DNS records
                                </MenuItem>
                                <MenuItem icon={<ArrowSync20Regular />} onClick={() => refreshDns(domain)}>
                                  Refresh records / sync to DigitalOcean
                                </MenuItem>
                                {domain.status === "verified" ? (
                                  <MenuItem icon={<CheckmarkCircle20Regular />} onClick={() => verify(domain)}>
                                    Re-check verification
                                  </MenuItem>
                                ) : null}
                                <MenuDivider />
                                <MenuItem icon={<Delete20Regular />} onClick={() => setToDelete(domain)}>
                                  Delete domain
                                </MenuItem>
                              </MenuList>
                            </MenuPopover>
                          </Menu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </PanelCard>

      {/* DNS records */}
      <Dialog open={!!dnsDomain} onOpenChange={(_, d) => !d.open && setDnsDomain(null)}>
        <DialogSurface className={s.dialogSurface}>
          <DialogBody>
            <DialogTitle>DNS records for {dnsDomain?.domain}</DialogTitle>
            <DialogContent>
              <MessageBar intent="info">
                <MessageBarBody>
                  Add these records at your DNS host (for example Cloudflare, DigitalOcean or your registrar).
                  Changes usually appear within minutes but can take up to an hour.
                </MessageBarBody>
              </MessageBar>
              <div className={s.stack}>
                {(dnsDomain?.dns_records ?? []).length === 0 ? (
                  <Body1 className={s.muted}>
                    No records stored yet. Use “Refresh records” to fetch them from {providerLabel}.
                  </Body1>
                ) : (
                  dnsDomain?.dns_records.map((r, i) => (
                    <div key={`${r.type}-${r.name}-${i}`} className={s.record}>
                      <div className={s.recordHead}>
                        <Badge appearance="filled" color="brand" shape="rounded">
                          {r.type}
                        </Badge>
                        {r.description ? <Caption1 className={s.muted}>{r.description}</Caption1> : null}
                      </div>
                      <CopyField label="Name / host" value={r.name} />
                      <CopyField label="Value" value={r.value} />
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDnsDomain(null)}>
                Close
              </Button>
              <Button
                icon={<ArrowSync20Regular />}
                onClick={() => dnsDomain && refreshDns(dnsDomain)}
                disabled={!!busyId}
              >
                Refresh records
              </Button>
              {dnsDomain?.status !== "verified" ? (
                <Button
                  appearance="primary"
                  icon={busyId ? <Spinner size="tiny" /> : <CheckmarkCircle20Regular />}
                  onClick={() => dnsDomain && verify(dnsDomain)}
                  disabled={!!busyId}
                >
                  Verify
                </Button>
              ) : null}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* SMTP credentials */}
      <Dialog open={!!smtp} onOpenChange={(_, d) => !d.open && setSmtp(null)}>
        <DialogSurface className={s.dialogSurface}>
          <DialogBody>
            <DialogTitle>SMTP credentials · {smtp?.domain.domain}</DialogTitle>
            <DialogContent>
              {smtp?.credentials.shared ? (
                <MessageBar intent="info">
                  <MessageBarBody>
                    <MessageBarTitle>Shared account login</MessageBarTitle>
                    {providerLabel} uses one SMTP login for your whole account, so every domain shares it.
                    You can only send from domains that are verified.
                  </MessageBarBody>
                </MessageBar>
              ) : (
                <MessageBar intent="warning">
                  <MessageBarBody>
                    <MessageBarTitle>Keep these secret</MessageBarTitle>
                    Anyone with this password can send email as {smtp?.domain.domain}.
                  </MessageBarBody>
                </MessageBar>
              )}
              <div className={s.stack}>
                <div className={s.grid2}>
                  <CopyField label="Server" value={smtp?.credentials.server ?? ""} />
                  <CopyField label="Port (STARTTLS)" value={String(smtp?.credentials.port ?? "")} />
                </div>
                <CopyField label="Username" value={smtp?.credentials.username ?? ""} />
                <CopyField label="Password" value={smtp?.credentials.password ?? ""} mask />
              </div>
            </DialogContent>
            <DialogActions>
              {!smtp?.credentials.shared && provider?.smtpMode !== "shared" ? (
                <Button
                  appearance="subtle"
                  icon={<Delete20Regular />}
                  onClick={() => smtp && setSmtpToDelete(smtp.domain)}
                >
                  Delete credentials
                </Button>
              ) : null}
              <Button appearance="primary" onClick={() => setSmtp(null)}>
                Done
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete ${toDelete?.domain}?`}
        busy={!!toDelete && busyId === toDelete.id}
        onCancel={() => setToDelete(null)}
        onConfirm={remove}
      >
        This removes the domain and every API key for it. Apps using those keys will stop sending. This can’t be
        undone.
      </ConfirmDialog>

      <ConfirmDialog
        open={!!smtpToDelete}
        title="Delete SMTP credentials?"
        busy={!!smtpToDelete && busyId === smtpToDelete.id}
        onCancel={() => setSmtpToDelete(null)}
        onConfirm={deleteSmtp}
      >
        Apps using this SMTP login will stop sending, and the login is removed from {providerLabel}.
      </ConfirmDialog>
    </>
  );
}
