import { render, type RenderOptions } from "@testing-library/react";
import { FluentProvider } from "@fluentui/react-components";
import { baobabLightTheme } from "@/theme/brand";

/** Render inside the Fluent theme, like the app's Providers do. */
export function renderWithTheme(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, {
    wrapper: ({ children }) => <FluentProvider theme={baobabLightTheme}>{children}</FluentProvider>,
    ...options,
  });
}

export * from "@testing-library/react";
