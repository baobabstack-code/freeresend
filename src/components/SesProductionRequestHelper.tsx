"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Body1,
  Button,
  Card,
  Field,
  Input,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Text,
  Textarea,
  Title1,
  Title3,
  tokens,
} from "@fluentui/react-components";
import {
  Checkmark20Regular,
  Copy20Regular,
  DocumentText24Regular,
  Open16Regular,
} from "@fluentui/react-icons";
import { deploymentReview, launchKit } from "@/config/launch-kit";
import { site } from "@/config/site";
import { buildSesProductionRequest, type SesProductionRequestInput } from "@/lib/ses-production-request";
import { Container, Eyebrow } from "./ui/Layout";
import { AppLink, LinkButton } from "./ui/links";
import { copyText } from "./ui/CopyField";
import { IconTile, PromoBand } from "./pages/PageBits";

const initialInput: SesProductionRequestInput = {
  sendingDomain: "",
  websiteUrl: "",
  region: "us-east-1",
  useCase: "",
  expectedVolume: "",
  optInSource: "",
  bounceHandling: "",
  complaintHandling: "",
};

type FieldConfig = {
  id: keyof SesProductionRequestInput;
  label: string;
  placeholder: string;
  multiline?: boolean;
  required?: boolean;
};

const fields: FieldConfig[] = [
  { id: "sendingDomain", label: "Sending domain", placeholder: "example.com", required: true },
  { id: "websiteUrl", label: "Website or app URL", placeholder: "https://example.com" },
  { id: "region", label: "AWS region", placeholder: "us-east-1", required: true },
  {
    id: "useCase",
    label: "Use case",
    placeholder: "Password resets, login codes, invoices, and account notifications",
    multiline: true,
  },
  { id: "expectedVolume", label: "Expected volume", placeholder: "2,000 messages per month with gradual ramp-up" },
  {
    id: "optInSource",
    label: "Recipient opt-in/source",
    placeholder: "Only registered users who request account email",
    multiline: true,
  },
  {
    id: "bounceHandling",
    label: "Bounce handling",
    placeholder: `SNS webhook into ${site.name} bounce handler`,
    multiline: true,
  },
  {
    id: "complaintHandling",
    label: "Complaint handling",
    placeholder: "SNS complaint webhook with suppression",
    multiline: true,
  },
];

const useStyles = makeStyles({
  section: {
    paddingTop: "32px",
    paddingBottom: "48px",
    "@media (min-width: 768px)": { paddingTop: "56px", paddingBottom: "72px" },
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "24px",
    alignItems: "start",
    "@media (min-width: 1024px)": { gridTemplateColumns: "minmax(0, 0.92fr) minmax(0, 1.08fr)", gap: "32px" },
  },
  card: { display: "flex", flexDirection: "column", gap: "16px", padding: "24px", minWidth: 0 },
  title: {
    fontSize: tokens.fontSizeHero700,
    lineHeight: tokens.lineHeightHero700,
    "@media (min-width: 768px)": { fontSize: tokens.fontSizeHero800, lineHeight: tokens.lineHeightHero800 },
  },
  muted: { color: tokens.colorNeutralForeground2 },
  fields: { display: "flex", flexDirection: "column", gap: "14px" },
  column: { display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 },
  outputHead: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },
  outputTitle: { display: "flex", flexDirection: "column", gap: "6px", minWidth: 0, flex: "1 1 240px" },
  subject: { overflowWrap: "anywhere" },
  pre: {
    margin: 0,
    maxHeight: "560px",
    overflow: "auto",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    padding: "16px",
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase400,
  },
});

export default function SesProductionRequestHelper() {
  const s = useStyles();
  const [input, setInput] = useState<SesProductionRequestInput>(initialInput);
  const [submittedInput, setSubmittedInput] = useState<SesProductionRequestInput | null>(null);
  const [copied, setCopied] = useState<"subject" | "body" | null>(null);

  const request = useMemo(() => buildSesProductionRequest(submittedInput ?? input), [input, submittedInput]);

  function updateInput(field: keyof SesProductionRequestInput, value: string) {
    setInput((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedInput(input);
  }

  async function copy(kind: "subject" | "body", value: string) {
    if (await copyText(value)) {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    }
  }

  return (
    <section className={s.section}>
      <Container>
        <div className={s.layout}>
          <Card className={s.card}>
            <form onSubmit={handleSubmit} className={s.fields}>
              <IconTile icon={<DocumentText24Regular />} />
              <Eyebrow>Free tool · Amazon SES</Eyebrow>
              <Title1 as="h1" className={s.title}>
                SES production request helper
              </Title1>
              <Text className={s.muted}>
                Draft the Amazon SES production access request from public rollout details before you send through{" "}
                {site.name} with SES. This step is specific to Amazon SES; domains sending through Brevo don&apos;t use the SES
                sandbox.
              </Text>

              {fields.map((field) => (
                <Field key={field.id} label={field.label} required={field.required}>
                  {field.multiline ? (
                    <Textarea
                      name={field.id}
                      value={input[field.id]}
                      onChange={(_, d) => updateInput(field.id, d.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      resize="vertical"
                    />
                  ) : (
                    <Input
                      name={field.id}
                      value={input[field.id]}
                      onChange={(_, d) => updateInput(field.id, d.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </Field>
              ))}

              <Button type="submit" appearance="primary" size="large" icon={<DocumentText24Regular />}>
                Generate request
              </Button>

              <MessageBar intent="warning">
                <MessageBarBody>
                  Do not paste AWS keys, SMTP passwords, customer lists, private logs or customer data into this tool.
                </MessageBarBody>
              </MessageBar>
            </form>
          </Card>

          <div className={s.column}>
            <Card className={s.card} aria-live="polite">
              <div className={s.outputHead}>
                <div className={s.outputTitle}>
                  <Eyebrow>Draft output</Eyebrow>
                  <Title3 as="h2" className={s.subject}>
                    {request.subject}
                  </Title3>
                </div>
                <Button
                  icon={copied === "subject" ? <Checkmark20Regular /> : <Copy20Regular />}
                  onClick={() => copy("subject", request.subject)}
                >
                  {copied === "subject" ? "Copied" : "Copy subject"}
                </Button>
              </div>
              <pre className={s.pre}>{request.body}</pre>
              <div>
                <Button
                  appearance="primary"
                  icon={copied === "body" ? <Checkmark20Regular /> : <Copy20Regular />}
                  onClick={() => copy("body", request.body)}
                >
                  {copied === "body" ? "Copied" : "Copy request body"}
                </Button>
              </div>
            </Card>

            <PromoBand
              eyebrow="Deployment review"
              title="Want the rollout checked first?"
              actions={
                <>
                  <LinkButton
                    href={deploymentReview.checkoutUrl}
                    target="_blank"
                    appearance="primary"
                    icon={<Open16Regular />}
                    iconPosition="after"
                  >
                    Book deployment review
                  </LinkButton>
                  <LinkButton href={launchKit.checkoutUrl} target="_blank" icon={<Open16Regular />} iconPosition="after">
                    Buy launch kit
                  </LinkButton>
                </>
              }
            >
              The {deploymentReview.price} deployment review covers SES sandbox status, region choice, DNS, webhook
              handling and smoke-test gaps before you send production traffic.
            </PromoBand>
            <Body1 className={s.muted}>
              Not sure your DNS is ready? Run the free <AppLink href="/tools/email-dns-checker">email DNS checker</AppLink>{" "}
              first.
            </Body1>
          </div>
        </div>
      </Container>
    </section>
  );
}
