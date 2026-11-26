"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Body1,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Field,
  Input,
  makeStyles,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
  Option,
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
import { Add20Regular, Delete20Regular, Dismiss20Regular, Key20Regular } from "@fluentui/react-icons";
import { api } from "@/lib/api";
import { PageHeader, PanelCard } from "./ui/Layout";
import CopyField from "./ui/CopyField";
import ConfirmDialog from "./ui/ConfirmDialog";
import { errorMessage, useNotify } from "./ui/toast";

interface Domain {
  id: string;
  domain: string;
  status: string;
}

interface ApiKey {
  id: string;
  domain_id: string;
  key_name: string;
  key_prefix: string;
  permissions: string[];
  last_used_at?: string;
  created_at: string;
  domains?: { domain: string };
}

const useStyles = makeStyles({
  tableCard: { padding: 0, overflow: "hidden" },
  tableWrap: { overflowX: "auto" },
  table: { minWidth: "720px" },
  name: { fontWeight: tokens.fontWeightSemibold },
  mono: { fontFamily: tokens.fontFamilyMonospace, fontSize: tokens.fontSizeBase200 },
  muted: { color: tokens.colorNeutralForeground3 },
  end: { display: "flex", justifyContent: "flex-end" },
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
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  gap: { height: "16px" },
  created: { display: "flex", flexDirection: "column", gap: "12px", width: "100%" },
  loading: { padding: "48px" },
});

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ApiKeysTab() {
  const s = useStyles();
  const notify = useNotify();

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [domainId, setDomainId] = useState("");
  const [keyName, setKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<ApiKey | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [keysRes, domainsRes] = await Promise.all([api.getApiKeys(), api.getDomains()]);
        setApiKeys(keysRes.data.apiKeys);
        setDomains(domainsRes.data.domains.filter((d: Domain) => d.status === "verified"));
      } catch (error) {
        notify.error("Couldn't load API keys", errorMessage(error));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setDomainId(domains[0]?.id ?? "");
    setKeyName("");
    setCreateOpen(true);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainId || !keyName.trim()) return;
    setCreating(true);
    try {
      const response = await api.createApiKey(domainId, keyName.trim());
      const domain = domains.find((d) => d.id === domainId);
      setApiKeys((list) => [
        { ...response.data.apiKey, domains: response.data.apiKey.domains ?? (domain ? { domain: domain.domain } : undefined) },
        ...list,
      ]);
      setCreatedKey(response.data.apiKey.key);
      setCreateOpen(false);
    } catch (error) {
      notify.error("Couldn't create API key", errorMessage(error));
    } finally {
      setCreating(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.deleteApiKey(toDelete.id);
      setApiKeys((list) => list.filter((k) => k.id !== toDelete.id));
      notify.success("API key deleted", `"${toDelete.key_name}" can no longer send email.`);
      setToDelete(null);
    } catch (error) {
      notify.error("Couldn't delete API key", errorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const noDomains = !loading && domains.length === 0;

  return (
    <>
      <PageHeader
        title="API keys"
        description="Each key can send from one verified domain. Use it as a Bearer token with the Resend-compatible API."
        actions={
          <Button appearance="primary" icon={<Add20Regular />} onClick={openCreate} disabled={loading || noDomains}>
            Create API key
          </Button>
        }
      />

      {noDomains ? (
        <>
          <MessageBar intent="warning">
            <MessageBarBody>
              <MessageBarTitle>No verified domains</MessageBarTitle>
              Verify a domain on the Domains tab before creating an API key.
            </MessageBarBody>
          </MessageBar>
          <div className={s.gap} />
        </>
      ) : null}

      {createdKey ? (
        <>
          <MessageBar intent="success" layout="multiline">
            <MessageBarBody>
              <div className={s.created}>
                <MessageBarTitle>Your new API key</MessageBarTitle>
                <Body1>Copy it now. For your security it won’t be shown again.</Body1>
                <CopyField value={createdKey} />
              </div>
            </MessageBarBody>
            <MessageBarActions
              containerAction={
                <Button
                  appearance="transparent"
                  aria-label="Dismiss"
                  icon={<Dismiss20Regular />}
                  onClick={() => setCreatedKey(null)}
                />
              }
            />
          </MessageBar>
          <div className={s.gap} />
        </>
      ) : null}

      <PanelCard className={s.tableCard}>
        {loading ? (
          <Spinner className={s.loading} label="Loading API keys…" />
        ) : apiKeys.length === 0 ? (
          <div className={s.empty}>
            <Key20Regular className={s.emptyIcon} />
            <Subtitle2>No API keys yet</Subtitle2>
            <Body1>Create a key to send email from your app.</Body1>
          </div>
        ) : (
          <div className={s.tableWrap}>
            <Table className={s.table} aria-label="API keys">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Domain</TableHeaderCell>
                  <TableHeaderCell>Key</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                  <TableHeaderCell>Last used</TableHeaderCell>
                  <TableHeaderCell aria-label="Actions" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <TableCellLayout media={<Key20Regular />}>
                        <span className={s.name}>{key.key_name}</span>{" "}
                        {key.permissions.map((p) => (
                          <Badge key={p} size="small" appearance="tint" color="informative">
                            {p}
                          </Badge>
                        ))}
                      </TableCellLayout>
                    </TableCell>
                    <TableCell>{key.domains?.domain ?? "Unknown"}</TableCell>
                    <TableCell>
                      <span className={s.mono}>{key.key_prefix}_••••••••</span>
                    </TableCell>
                    <TableCell>
                      <Text className={s.muted}>{formatDate(key.created_at)}</Text>
                    </TableCell>
                    <TableCell>
                      <Text className={s.muted}>{key.last_used_at ? formatDate(key.last_used_at) : "Never"}</Text>
                    </TableCell>
                    <TableCell>
                      <div className={s.end}>
                        <Button
                          size="small"
                          appearance="subtle"
                          icon={<Delete20Regular />}
                          aria-label={`Delete ${key.key_name}`}
                          onClick={() => setToDelete(key)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </PanelCard>

      <Dialog open={createOpen} onOpenChange={(_, d) => !creating && setCreateOpen(d.open)}>
        <DialogSurface>
          <form onSubmit={create}>
            <DialogBody>
              <DialogTitle>Create API key</DialogTitle>
              <DialogContent className={s.form}>
                <Field label="Domain" required>
                  <Dropdown
                    value={domains.find((d) => d.id === domainId)?.domain ?? ""}
                    selectedOptions={domainId ? [domainId] : []}
                    onOptionSelect={(_, d) => setDomainId(d.optionValue ?? "")}
                    placeholder="Choose a verified domain"
                  >
                    {domains.map((d) => (
                      <Option key={d.id} value={d.id}>
                        {d.domain}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
                <Field label="Key name" required hint="Helps you recognise where the key is used, e.g. “Production app”.">
                  <Input value={keyName} onChange={(_, d) => setKeyName(d.value)} placeholder="Production app" />
                </Field>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setCreateOpen(false)} disabled={creating}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  appearance="primary"
                  disabled={creating || !domainId || !keyName.trim()}
                  icon={creating ? <Spinner size="tiny" /> : undefined}
                >
                  {creating ? "Creating…" : "Create key"}
                </Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete “${toDelete?.key_name}”?`}
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={remove}
      >
        Apps using this key will stop sending immediately. This can’t be undone.
      </ConfirmDialog>
    </>
  );
}
