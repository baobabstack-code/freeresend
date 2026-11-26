"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Body1,
  Button,
  Caption1,
  Field,
  Input,
  makeStyles,
  mergeClasses,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  Spinner,
  Subtitle1,
  Text,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowClockwise16Regular,
  CheckmarkCircle48Regular,
  Mail24Regular,
} from "@fluentui/react-icons";
import { site } from "@/config/site";

// Google Analytics (gtag.js) is optional; it is only present when the site loads it.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface WaitlistSignupProps {
  estimatedVolume?: number;
  onSuccess?: () => void;
  compact?: boolean;
  className?: string;
  trackingContext?: string; // For analytics tracking
}

interface UTMParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

interface FormData {
  email: string;
  estimatedVolume?: number;
  currentProvider?: string;
  referralSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    created_at: string;
  };
}

interface FormState {
  email: string;
  volume: string | number;
  currentProvider: string;
  loading: boolean;
  submitted: boolean;
  error: string;
  emailError: string;
  retryCount: number;
  optimisticSubmit: boolean;
}

// Capture UTM parameters from the current URL
const captureUTMParams = (): UTMParams => {
  if (typeof window === "undefined") return {};

  const urlParams = new URLSearchParams(window.location.search);
  return {
    utmSource: urlParams.get("utm_source") || undefined,
    utmMedium: urlParams.get("utm_medium") || undefined,
    utmCampaign: urlParams.get("utm_campaign") || undefined,
  };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const useStyles = makeStyles({
  root: {
    padding: "24px",
    minWidth: 0,
  },
  compact: {
    padding: "16px",
  },
  intro: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "6px",
    marginBottom: "20px",
  },
  introIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: "32px",
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  submit: {
    width: "100%",
  },
  privacy: {
    display: "block",
    marginTop: "16px",
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
  },
  success: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "8px",
  },
  successIcon: {
    color: tokens.colorStatusSuccessForeground1,
    fontSize: "48px",
  },
});

export default function WaitlistSignup({
  estimatedVolume,
  onSuccess,
  compact = false,
  className = "",
  trackingContext = "unknown",
}: WaitlistSignupProps) {
  const s = useStyles();
  const baseId = useId();
  const emailErrorId = `${baseId}-email-error`;

  const [formState, setFormState] = useState<FormState>({
    email: "",
    volume: estimatedVolume || "",
    currentProvider: "",
    loading: false,
    submitted: false,
    error: "",
    emailError: "",
    retryCount: 0,
    optimisticSubmit: false,
  });

  // UTM params are read once on mount and kept in a ref, so trackEvent stays stable
  // (storing them in state made trackEvent change identity every render and re-ran
  // the mount effect in a loop: "Maximum update depth exceeded").
  const utmParamsRef = useRef<UTMParams>({});

  const trackEvent = useCallback((eventName: string, properties: Record<string, unknown> = {}) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        ...utmParamsRef.current,
      });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Analytics Event:", eventName, properties);
    }
  }, []);

  // Capture UTM parameters and track the form view once, on mount.
  useEffect(() => {
    utmParamsRef.current = captureUTMParams();

    trackEvent("waitlist_form_viewed", {
      context: trackingContext,
      has_estimated_volume: !!estimatedVolume,
      compact_mode: compact,
    });
    // Intentionally mount-only: this records a single "viewed" event per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time email validation with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const emailError =
        formState.email && !EMAIL_REGEX.test(formState.email)
          ? "Please enter a valid email address"
          : "";
      setFormState((prev) => (prev.emailError === emailError ? prev : { ...prev, emailError }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formState.email]);

  const handleOptimisticUpdate = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      optimisticSubmit: true,
      loading: true,
      error: "",
    }));

    trackEvent("waitlist_form_submitted_optimistic", {
      context: trackingContext,
      email_domain: formState.email.split("@")[1],
      has_volume: !!formState.volume,
      has_provider: !!formState.currentProvider,
    });
  }, [trackingContext, formState.email, formState.volume, formState.currentProvider, trackEvent]);

  const handleRetry = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      error: "",
      loading: false,
      optimisticSubmit: false,
      retryCount: prev.retryCount + 1,
    }));

    trackEvent("waitlist_form_retry", {
      context: trackingContext,
      retry_count: formState.retryCount + 1,
    });
  }, [trackingContext, formState.retryCount, trackEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormState((prev) => ({
      ...prev,
      error: "",
      emailError: "",
    }));

    if (!formState.email) {
      setFormState((prev) => ({ ...prev, emailError: "Email is required" }));
      trackEvent("waitlist_form_validation_error", {
        context: trackingContext,
        error_type: "email_required",
      });
      return;
    }

    if (!EMAIL_REGEX.test(formState.email)) {
      setFormState((prev) => ({ ...prev, emailError: "Please enter a valid email address" }));
      trackEvent("waitlist_form_validation_error", {
        context: trackingContext,
        error_type: "email_invalid",
      });
      return;
    }

    handleOptimisticUpdate();

    try {
      const formData: FormData = {
        email: formState.email.trim(),
        estimatedVolume: formState.volume ? parseInt(formState.volume.toString(), 10) : undefined,
        currentProvider: formState.currentProvider.trim() || undefined,
        referralSource: (typeof document !== "undefined" ? document.referrer : "") || undefined,
        ...utmParamsRef.current,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to join waitlist");
      }

      setFormState((prev) => ({
        ...prev,
        submitted: true,
        loading: false,
        optimisticSubmit: false,
      }));

      trackEvent("waitlist_form_submitted_success", {
        context: trackingContext,
        email_domain: formState.email.split("@")[1],
        has_volume: !!formState.volume,
        has_provider: !!formState.currentProvider,
        retry_count: formState.retryCount,
        signup_id: result.data?.id,
      });

      onSuccess?.();
    } catch (err: unknown) {
      const errorObj = err as { message?: string; name?: string };
      let errorMessage = "Failed to join waitlist. Please try again.";
      let errorType = "unknown";

      if (errorObj.name === "AbortError") {
        errorMessage = "Request timed out. Please check your connection and try again.";
        errorType = "timeout";
      } else if (errorObj.message?.includes("409")) {
        errorMessage = "This email is already on our waitlist.";
        errorType = "duplicate";
      } else if (errorObj.message) {
        errorMessage = errorObj.message;
        errorType = "api_error";
      } else {
        errorType = "network_error";
      }

      setFormState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
        optimisticSubmit: false,
      }));

      trackEvent("waitlist_form_submitted_error", {
        context: trackingContext,
        error_type: errorType,
        error_message: errorMessage,
        retry_count: formState.retryCount,
      });
    }
  };

  const rootClass = mergeClasses(s.root, compact && s.compact, className);

  if (formState.submitted) {
    return (
      <div className={rootClass}>
        <div className={s.success} role="status">
          <CheckmarkCircle48Regular className={s.successIcon} aria-hidden="true" />
          <Subtitle1 as="h3">You&apos;re on the waitlist!</Subtitle1>
          <Body1 className={s.muted}>
            We&apos;ll notify you when the hosted version of {site.name} becomes available.
          </Body1>
          {formState.volume ? (
            <Caption1 className={s.muted}>
              Expected volume: {parseInt(formState.volume.toString(), 10).toLocaleString("en-US")} emails/month
            </Caption1>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={rootClass}>
      {!compact && (
        <div className={s.intro}>
          <Mail24Regular className={s.introIcon} aria-hidden="true" />
          <Subtitle1 as="h3">Join the waitlist</Subtitle1>
          <Body1 className={s.muted}>
            Be the first to know when hosted {site.name} launches.
          </Body1>
        </div>
      )}

      <form onSubmit={handleSubmit} className={s.form}>
        <Field
          label="Email address"
          required
          validationState={formState.emailError ? "error" : "none"}
          validationMessage={
            formState.emailError ? { id: emailErrorId, children: formState.emailError } : undefined
          }
        >
          <Input
            type="email"
            value={formState.email}
            onChange={(e, data) => {
              setFormState((prev) => ({ ...prev, email: data.value }));
              trackEvent("waitlist_form_email_input", {
                context: trackingContext,
                has_value: !!data.value,
              });
            }}
            onBlur={() => {
              trackEvent("waitlist_form_email_blur", {
                context: trackingContext,
                email_domain: formState.email.split("@")[1] || "",
                is_valid: EMAIL_REGEX.test(formState.email),
              });
            }}
            placeholder="you@company.com"
            autoComplete="email"
            disabled={formState.loading}
          />
        </Field>

        <Field
          label="Expected monthly email volume (optional)"
          hint="Helps us understand your needs."
        >
          <Input
            type="number"
            value={formState.volume.toString()}
            onChange={(e, data) => {
              setFormState((prev) => ({ ...prev, volume: data.value }));
              trackEvent("waitlist_form_volume_input", {
                context: trackingContext,
                volume: parseInt(data.value, 10) || 0,
              });
            }}
            placeholder="e.g. 50000"
            min={0}
            inputMode="numeric"
            disabled={formState.loading}
          />
        </Field>

        {!compact && (
          <Field label="Current email provider (optional)">
            <Input
              type="text"
              value={formState.currentProvider}
              onChange={(e, data) => {
                setFormState((prev) => ({ ...prev, currentProvider: data.value }));
                trackEvent("waitlist_form_provider_input", {
                  context: trackingContext,
                  provider: data.value.toLowerCase(),
                });
              }}
              placeholder="e.g. Resend, SendGrid, Mailgun"
              maxLength={100}
              disabled={formState.loading}
            />
          </Field>
        )}

        {formState.error && (
          <MessageBar intent="error" layout="multiline">
            <MessageBarBody>{formState.error}</MessageBarBody>
            {formState.retryCount < 3 && (
              <MessageBarActions>
                <Button
                  type="button"
                  size="small"
                  icon={<ArrowClockwise16Regular />}
                  onClick={handleRetry}
                >
                  Try again
                </Button>
              </MessageBarActions>
            )}
          </MessageBar>
        )}

        <Button
          type="submit"
          appearance="primary"
          size="large"
          className={s.submit}
          disabled={formState.loading || !!formState.emailError || !formState.email}
          icon={formState.loading ? <Spinner size="tiny" /> : undefined}
          onClick={() => {
            trackEvent("waitlist_form_submit_clicked", {
              context: trackingContext,
              has_email: !!formState.email,
              has_volume: !!formState.volume,
              has_provider: !!formState.currentProvider,
            });
          }}
        >
          {formState.loading
            ? formState.optimisticSubmit
              ? "Joining..."
              : "Submitting..."
            : "Join waitlist"}
        </Button>
      </form>

      <Text size={200} className={s.privacy}>
        We&apos;ll only use your email to tell you about the hosted {site.name} launch. No spam, and you
        can unsubscribe at any time.
      </Text>
    </div>
  );
}
