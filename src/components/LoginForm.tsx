"use client";

import { useState } from "react";
import {
  Body1,
  Button,
  Card,
  Field,
  Input,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Spinner,
  Title3,
  tokens,
} from "@fluentui/react-components";
import { LockClosed20Regular, Mail20Regular } from "@fluentui/react-icons";
import { useAuth } from "@/contexts/AuthContext";
import { site } from "@/config/site";
import BrandLogo from "./ui/BrandLogo";
import { AppLink } from "./ui/links";

const useStyles = makeStyles({
  page: {
    flex: 1,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    backgroundImage: `radial-gradient(circle at 20% 0%, rgba(245, 158, 11, 0.16), transparent 45%), radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.10), transparent 40%)`,
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "32px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  head: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" },
  muted: { color: tokens.colorNeutralForeground3 },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  back: { textAlign: "center" },
});

export default function LoginForm() {
  const s = useStyles();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <Card className={s.card}>
        <div className={s.head}>
          <BrandLogo size="large" href="/" />
          <Title3 as="h1">Sign in to {site.name}</Title3>
          <Body1 className={s.muted}>Manage your sending domains, API keys and email logs.</Body1>
        </div>

        {error ? (
          <MessageBar intent="error">
            <MessageBarBody>{error}</MessageBarBody>
          </MessageBar>
        ) : null}

        <form className={s.form} onSubmit={handleSubmit}>
          <Field label="Email address" required>
            <Input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(_, d) => setEmail(d.value)}
              contentBefore={<Mail20Regular />}
              disabled={loading}
            />
          </Field>
          <Field label="Password" required>
            <Input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(_, d) => setPassword(d.value)}
              contentBefore={<LockClosed20Regular />}
              disabled={loading}
            />
          </Field>
          <Button
            type="submit"
            appearance="primary"
            size="large"
            disabled={loading || !email || !password}
            icon={loading ? <Spinner size="tiny" /> : undefined}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <Body1 className={s.back}>
          <AppLink href="/">← Back to {site.name}</AppLink>
        </Body1>
      </Card>
    </div>
  );
}
