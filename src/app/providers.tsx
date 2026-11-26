"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useServerInsertedHTML } from "next/navigation";
import {
  createDOMRenderer,
  FluentProvider,
  makeStyles,
  RendererProvider,
  renderToStyleElements,
  SSRProvider,
  Toaster,
  tokens,
} from "@fluentui/react-components";
import { AuthProvider } from "@/contexts/AuthContext";
import { baobabDarkTheme, baobabLightTheme } from "@/theme/brand";
import { APP_TOASTER_ID } from "@/components/ui/toast";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia?.(DARK_QUERY);
  mql?.addEventListener?.("change", onChange);
  return () => mql?.removeEventListener?.("change", onChange);
}

/** Follows the visitor's system light/dark setting. Server render is light. */
function usePrefersDark(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.(DARK_QUERY).matches ?? false,
    () => false
  );
}

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
  },
});

function ThemedApp({ children }: { children: React.ReactNode }) {
  const dark = usePrefersDark();
  return (
    <FluentProvider theme={dark ? baobabDarkTheme : baobabLightTheme}>
      <Shell>{children}</Shell>
    </FluentProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Toaster toasterId={APP_TOASTER_ID} position="bottom-end" />
      {children}
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [renderer] = useState(() => createDOMRenderer());
  const didRenderRef = useRef(false);

  // Stream Griffel's CSS into the server HTML so there's no unstyled flash.
  useServerInsertedHTML(() => {
    if (didRenderRef.current) return;
    didRenderRef.current = true;
    return <>{renderToStyleElements(renderer)}</>;
  });

  return (
    <RendererProvider renderer={renderer}>
      <SSRProvider>
        <AuthProvider>
          <ThemedApp>{children}</ThemedApp>
        </AuthProvider>
      </SSRProvider>
    </RendererProvider>
  );
}
