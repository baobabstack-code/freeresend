import { sesProvider } from "./ses";
import { brevoProvider } from "./brevo";
import type { EmailProvider, ProviderName, SendEmailOptions } from "./types";

export * from "./types";

/** The provider selected by EMAIL_PROVIDER (defaults to Amazon SES). */
export function getProviderName(): ProviderName {
  const value = (process.env.EMAIL_PROVIDER || "ses").trim().toLowerCase();
  if (value === "brevo") return "brevo";
  if (value !== "ses") {
    console.warn(`Unknown EMAIL_PROVIDER "${value}", falling back to Amazon SES`);
  }
  return "ses";
}

export function getEmailProvider(name: ProviderName = getProviderName()): EmailProvider {
  return name === "brevo" ? brevoProvider : sesProvider;
}

/** Send through the configured provider; returns the provider's message ID. */
export function sendEmail(options: SendEmailOptions): Promise<string> {
  return getEmailProvider().sendEmail(options);
}
