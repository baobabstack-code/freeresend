/**
 * Component tests for PricingCalculator
 */

import React from "react";
import { renderWithTheme as render, screen, waitFor, within } from "@/test-utils/render";
import userEvent from "@testing-library/user-event";
import PricingCalculator from "../PricingCalculator";

// Mock WaitlistSignup component
jest.mock("../WaitlistSignup", () => {
  return function MockWaitlistSignup({
    estimatedVolume,
    onSuccess,
    compact,
    trackingContext,
  }: {
    estimatedVolume?: number;
    onSuccess?: () => void;
    compact?: boolean;
    trackingContext?: string;
  }) {
    return (
      <div data-testid="waitlist-signup">
        <div>Estimated Volume: {estimatedVolume}</div>
        <div>Compact: {compact ? "true" : "false"}</div>
        <div>Tracking Context: {trackingContext}</div>
        <button onClick={() => onSuccess?.()} data-testid="waitlist-submit">
          Join Waitlist
        </button>
      </div>
    );
  };
});

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: true });

const heading = (name: string | RegExp) => screen.getByRole("heading", { name });

describe("PricingCalculator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("renders all four cost cards", () => {
    render(<PricingCalculator />);

    expect(heading("Resend")).toBeInTheDocument();
    expect(heading("Self-hosted")).toBeInTheDocument();
    expect(heading("Hosted")).toBeInTheDocument();
    expect(heading("Best savings")).toBeInTheDocument();

    expect(heading(/Hosted version: Baobab Mail/)).toBeInTheDocument();
  });

  it("renders Fluent volume controls", () => {
    render(<PricingCalculator />);

    expect(screen.getByLabelText("Monthly email volume")).toHaveValue(50000);
    expect(screen.getByRole("slider", { name: /monthly email volume slider/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Set volume to 50K" })).toHaveAttribute("aria-pressed", "true");
  });

  it("updates the volume from a quick pick and persists it", async () => {
    const user = userEvent.setup();
    render(<PricingCalculator />);

    await user.click(screen.getByRole("button", { name: "Set volume to 100K" }));

    expect(screen.getByLabelText("Monthly email volume")).toHaveValue(100000);
    expect(screen.getByText("100K emails/month")).toBeInTheDocument();
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith("pricing-calculator-volume", "100000");
    });
  });

  it("shows hosted pricing details", () => {
    render(<PricingCalculator />);

    expect(heading("Pricing breakdown")).toBeInTheDocument();
    expect(heading("Features")).toBeInTheDocument();
    expect(screen.getAllByText(/Brevo/).length).toBeGreaterThan(0);
  });

  it("displays waitlist signup by default", () => {
    render(<PricingCalculator />);

    expect(heading("Get early access to the hosted version")).toBeInTheDocument();
    expect(screen.getByText("Join the waitlist and be the first to know when it launches")).toBeInTheDocument();
    const waitlist = screen.getByTestId("waitlist-signup");
    expect(within(waitlist).getByText("Compact: true")).toBeInTheDocument();
    expect(within(waitlist).getByText("Tracking Context: pricing-calculator")).toBeInTheDocument();
  });

  it("can be rendered in embeddable mode", () => {
    render(<PricingCalculator embeddable={true} />);

    expect(heading("Resend")).toBeInTheDocument();
    expect(heading("Self-hosted")).toBeInTheDocument();
    expect(heading("Hosted")).toBeInTheDocument();

    expect(screen.queryByText("Get early access to the hosted version")).not.toBeInTheDocument();
  });

  it("can hide waitlist signup", () => {
    render(<PricingCalculator showWaitlist={false} />);

    expect(screen.queryByText("Get early access to the hosted version")).not.toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("shows advanced breakdown when toggled", async () => {
    const user = userEvent.setup();
    render(<PricingCalculator />);

    const toggle = screen.getByRole("button", { name: /show breakdown/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);

    expect(screen.getByRole("button", { name: /hide breakdown/i })).toHaveAttribute("aria-expanded", "true");
    expect(heading("Self-hosted cost breakdown")).toBeInTheDocument();
  });

  it("handles waitlist success state", async () => {
    const user = userEvent.setup();
    render(<PricingCalculator />);

    expect(screen.queryByText("On waitlist")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("waitlist-submit"));

    await waitFor(() => {
      expect(screen.getByText("On waitlist")).toBeInTheDocument();
      expect(screen.getByText("You're on the waitlist! We'll notify you when it's ready.")).toBeInTheDocument();
    });
  });

  it("does not show FreeResend branding", () => {
    const { container } = render(<PricingCalculator />);
    expect(container).not.toHaveTextContent(/FreeResend/);
  });
});
