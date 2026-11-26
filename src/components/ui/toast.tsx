"use client";

import { useCallback } from "react";
import {
  Toast,
  ToastBody,
  ToastTitle,
  useToastController,
  type ToastIntent,
} from "@fluentui/react-components";

export const APP_TOASTER_ID = "app-toaster";

/** Show a toast anywhere under the app Providers. */
export function useNotify() {
  const { dispatchToast } = useToastController(APP_TOASTER_ID);

  const notify = useCallback(
    (intent: ToastIntent, title: string, body?: string) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{title}</ToastTitle>
          {body ? <ToastBody>{body}</ToastBody> : null}
        </Toast>,
        { intent, timeout: intent === "error" ? 8000 : 4000 }
      );
    },
    [dispatchToast]
  );

  return {
    success: (title: string, body?: string) => notify("success", title, body),
    error: (title: string, body?: string) => notify("error", title, body),
    info: (title: string, body?: string) => notify("info", title, body),
    warning: (title: string, body?: string) => notify("warning", title, body),
  };
}

/** Pull a readable message out of an unknown error (axios or Error). */
export function errorMessage(error: unknown, fallback = "Something went wrong"): string {
  const e = error as {
    response?: { data?: { error?: string; details?: unknown; message?: string } };
    message?: string;
  };
  const data = e?.response?.data;
  if (data?.error) {
    return typeof data.details === "string" ? `${data.error}: ${data.details}` : data.error;
  }
  return data?.message || e?.message || fallback;
}
