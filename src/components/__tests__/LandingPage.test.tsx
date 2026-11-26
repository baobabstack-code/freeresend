import React from "react";
import { renderWithTheme, screen } from "@/test-utils/render";
import LandingPage from "../LandingPage";

describe("LandingPage", () => {
  it("renders a single hero heading with the product positioning", () => {
    renderWithTheme(<LandingPage />);

    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/transactional email/i);
    expect(screen.getAllByText(/brevo or amazon ses/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/resend-compatible/i).length).toBeGreaterThan(0);
  });

  it("does not show the old FreeResend branding or author links", () => {
    const { container } = renderWithTheme(<LandingPage />);
    const main = container.querySelector("main");
    expect(main).not.toBeNull();
    expect(main!.textContent).not.toMatch(/freeresend/i);
    // The footer's upstream MIT credit is intentional; check the page body only.
    main!.querySelectorAll("a").forEach((a) => {
      expect(a.getAttribute("href") ?? "").not.toMatch(/eibrahim|x\.com|elitecoders|elitesaas/);
    });
  });

  it("keeps the features section anchor for the header nav", () => {
    const { container } = renderWithTheme(<LandingPage />);
    expect(container.querySelector("section#features")).not.toBeNull();
    expect(screen.getByRole("heading", { name: /everything you need/i })).toBeInTheDocument();
  });

  it("points the main calls to action at pricing and login", () => {
    renderWithTheme(<LandingPage />);

    expect(screen.getByRole("link", { name: /see pricing/i })).toHaveAttribute("href", "/pricing");
    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute("href", "/pricing");
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /check a domain/i })).toHaveAttribute(
      "href",
      "/tools/email-dns-checker"
    );
  });

  it("shows a copyable code sample", () => {
    renderWithTheme(<LandingPage />);
    expect(screen.getByRole("button", { name: /copy code/i })).toBeInTheDocument();
    expect(screen.getByText(/RESEND_BASE_URL/)).toBeInTheDocument();
  });
});
