"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Body1,
  Button,
  Caption1,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Field,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Option,
  Spinner,
  Subtitle2,
  Tab,
  TabList,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowClockwise20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  Mail20Regular,
} from "@fluentui/react-icons";
import { api } from "@/lib/api";
import { PageHeader, PanelCard } from "./ui/Layout";
import StatusBadge from "./ui/StatusBadge";
import CopyField from "./ui/CopyField";
import { errorMessage, useNotify } from "./ui/toast";

type Status = "pending" | "sent" | "failed" | "delivered" | "bounced" | "complained";

interface WebhookEvent {
  id: string;
  event_type: string;
  created_at: string;
}

interface EmailLog {
  id: string;
  from_email: string;
  to_emails: string[];
  cc_emails?: string[];
  bcc_emails?: string[];
  subject: string;
  status: Status;
  created_at: string;
  html_content?: string;
  text_content?: string;
  error_message?: string;
  message_id?: string;
  ses_message_id?: string;
  provider?: string;
  domains?: { domain: string };
  api_keys?: { key_name: string } | null;
  webhook_events?: WebhookEvent[];
}

interface Domain {
  id: string;
  domain: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUSES: Status[] = ["sent", "delivered", "bounced", "complained", "failed", "pending"];

const useStyles = makeStyles({
  filters: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
    alignItems: "end",
    "@media (min-width: 640px)": { gridTemplateColumns: "1fr 1fr auto" },
  },
  gap: { height: "16px" },
  tableCard: { padding: 0, overflow: "hidden" },
  tableWrap: { overflowX: "auto" },
  table: { minWidth: "760px" },
  row: { cursor: "pointer" },
  subject: { fontWeight: tokens.fontWeightSemibold },
  muted: { color: tokens.colorNeutralForeground3 },
  ellipsis: {
    display: "block",
    maxWidth: "280px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  pager: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    flexWrap: "wrap",
    padding: "12px 16px",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  pagerButtons: { display: "flex", gap: "8px" },
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
  dialogSurface: { maxWidth: "860px", width: "calc(100vw - 32px)" },
  meta: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
    marginBottom: "16px",
    "@media (min-width: 600px)": { gridTemplateColumns: "1fr 1fr" },
  },
  metaItem: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 },
  metaValue: { overflowWrap: "anywhere" },
  preview: {
    width: "100%",
    height: "420px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: "#ffffff",
    marginTop: "12px",
  },
  text: {
    whiteSpace: "pre-wrap",
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    padding: "12px",
    marginTop: "12px",
    maxHeight: "420px",
    overflow: "auto",
  },
  timeline: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" },
  event: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    paddingBottom: "10px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  loading: { padding: "48px" },
});

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  const s = useStyles();
  return (
    <div className={s.metaItem}>
      <Caption1 className={s.muted}>{label}</Caption1>
      <Body1 className={s.metaValue}>{children}</Body1>
    </div>
  );
}

export default function EmailLogsTab() {
  const s = useStyles();
  const notify = useNotify();

  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ domain_id: "", status: "", page: 1, limit: 25 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, totalPages: 0 });

  const [selected, setSelected] = useState<EmailLog | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [view, setView] = useState<"html" | "text" | "events">("html");

  useEffect(() => {
    api
      .getDomains()
      .then((r) => setDomains(r.data.domains))
      .catch(() => setDomains([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getEmailLogs(filters);
      setEmails(response.data.emails);
      setPagination(response.data.pagination);
    } catch (error) {
      notify.error("Couldn't load email logs", errorMessage(error));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (email: EmailLog) => {
    setSelected(email);
    setLoadingDetail(true);
    try {
      const response = await api.getEmail(email.id);
      const detail: EmailLog = response.data.email;
      setSelected(detail);
      setView(detail.html_content ? "html" : detail.text_content ? "text" : "events");
    } catch (error) {
      notify.error("Couldn't load email", errorMessage(error));
    } finally {
      setLoadingDetail(false);
    }
  };

  const domainLabel = domains.find((d) => d.id === filters.domain_id)?.domain ?? "All domains";
  const statusLabel = filters.status || "All statuses";

  return (
    <>
      <PageHeader
        title="Email logs"
        description="Every email sent through the API, with its latest delivery status."
        actions={
          <Button icon={<ArrowClockwise20Regular />} onClick={load} disabled={loading}>
            Refresh
          </Button>
        }
      />

      <PanelCard>
        <div className={s.filters}>
          <Field label="Domain">
            <Dropdown
              value={domainLabel}
              selectedOptions={[filters.domain_id]}
              onOptionSelect={(_, d) => setFilters((f) => ({ ...f, domain_id: d.optionValue ?? "", page: 1 }))}
            >
              <Option value="">All domains</Option>
              {domains.map((d) => (
                <Option key={d.id} value={d.id}>
                  {d.domain}
                </Option>
              ))}
            </Dropdown>
          </Field>
          <Field label="Status">
            <Dropdown
              value={statusLabel}
              selectedOptions={[filters.status]}
              onOptionSelect={(_, d) => setFilters((f) => ({ ...f, status: d.optionValue ?? "", page: 1 }))}
            >
              <Option value="">All statuses</Option>
              {STATUSES.map((st) => (
                <Option key={st} value={st}>
                  {st}
                </Option>
              ))}
            </Dropdown>
          </Field>
          <Text className={s.muted}>{pagination.total} emails</Text>
        </div>
      </PanelCard>

      <div className={s.gap} />

      <PanelCard className={s.tableCard}>
        {loading ? (
          <Spinner className={s.loading} label="Loading email logs…" />
        ) : emails.length === 0 ? (
          <div className={s.empty}>
            <Mail20Regular className={s.emptyIcon} />
            <Subtitle2>No emails yet</Subtitle2>
            <Body1>Emails you send through the API will show up here.</Body1>
          </div>
        ) : (
          <>
            <div className={s.tableWrap}>
              <Table className={s.table} aria-label="Email logs">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Subject</TableHeaderCell>
                    <TableHeaderCell>To</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Sent</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow
                      key={email.id}
                      className={s.row}
                      onClick={() => open(email)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          open(email);
                        }
                      }}
                      tabIndex={0}
                      aria-label={`Open email ${email.subject || "(no subject)"}`}
                    >
                      <TableCell>
                        <span className={`${s.subject} ${s.ellipsis}`}>{email.subject || "(no subject)"}</span>
                        <Caption1 className={`${s.muted} ${s.ellipsis}`}>from {email.from_email}</Caption1>
                      </TableCell>
                      <TableCell>
                        <span className={s.ellipsis}>{email.to_emails.join(", ")}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={email.status} />
                      </TableCell>
                      <TableCell>
                        <Text className={s.muted}>{formatDateTime(email.created_at)}</Text>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {pagination.totalPages > 1 ? (
              <div className={s.pager}>
                <Text className={s.muted}>
                  Page {pagination.page} of {pagination.totalPages}
                </Text>
                <div className={s.pagerButtons}>
                  <Button
                    icon={<ChevronLeft20Regular />}
                    disabled={pagination.page <= 1}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <Button
                    icon={<ChevronRight20Regular />}
                    iconPosition="after"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </PanelCard>

      <Dialog open={!!selected} onOpenChange={(_, d) => !d.open && setSelected(null)}>
        <DialogSurface className={s.dialogSurface}>
          <DialogBody>
            <DialogTitle>{selected?.subject || "(no subject)"}</DialogTitle>
            <DialogContent>
              {selected ? (
                <>
                  <div className={s.meta}>
                    <Meta label="From">{selected.from_email}</Meta>
                    <Meta label="To">{selected.to_emails.join(", ")}</Meta>
                    {selected.cc_emails?.length ? <Meta label="Cc">{selected.cc_emails.join(", ")}</Meta> : null}
                    {selected.bcc_emails?.length ? <Meta label="Bcc">{selected.bcc_emails.join(", ")}</Meta> : null}
                    <Meta label="Status">
                      <StatusBadge status={selected.status} />
                    </Meta>
                    <Meta label="Sent">{formatDateTime(selected.created_at)}</Meta>
                    {selected.api_keys?.key_name ? <Meta label="API key">{selected.api_keys.key_name}</Meta> : null}
                    {selected.provider ? (
                      <Meta label="Provider">{selected.provider === "brevo" ? "Brevo" : "Amazon SES"}</Meta>
                    ) : null}
                  </div>
                  {selected.error_message ? (
                    <MessageBar intent="error">
                      <MessageBarBody>{selected.error_message}</MessageBarBody>
                    </MessageBar>
                  ) : null}
                  {selected.message_id || selected.ses_message_id ? (
                    <CopyField label="Message ID" value={(selected.message_id || selected.ses_message_id) as string} />
                  ) : null}

                  <TabList
                    selectedValue={view}
                    onTabSelect={(_, d) => setView(d.value as typeof view)}
                    style={{ marginTop: 16 }}
                  >
                    <Tab value="html" disabled={!selected.html_content}>
                      HTML
                    </Tab>
                    <Tab value="text" disabled={!selected.text_content}>
                      Text
                    </Tab>
                    <Tab value="events">Events ({selected.webhook_events?.length ?? 0})</Tab>
                  </TabList>

                  {loadingDetail ? (
                    <Spinner className={s.loading} />
                  ) : view === "html" && selected.html_content ? (
                    <iframe
                      title="Email HTML preview"
                      className={s.preview}
                      srcDoc={selected.html_content}
                      sandbox=""
                      referrerPolicy="no-referrer"
                    />
                  ) : view === "text" && selected.text_content ? (
                    <div className={s.text}>{selected.text_content}</div>
                  ) : (
                    <div className={s.timeline}>
                      {(selected.webhook_events ?? []).length === 0 ? (
                        <Body1 className={s.muted}>
                          No delivery events yet. They arrive from your provider’s webhook within a few minutes.
                        </Body1>
                      ) : (
                        selected.webhook_events!.map((ev) => (
                          <div key={ev.id} className={s.event}>
                            <Text weight="semibold">{ev.event_type.replace(/_/g, " ")}</Text>
                            <Caption1 className={s.muted}>{formatDateTime(ev.created_at)}</Caption1>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => setSelected(null)}>
                Close
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
