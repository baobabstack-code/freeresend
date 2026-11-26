import React from "react";
import { renderWithTheme as render, screen, waitFor, fireEvent } from "@/test-utils/render";
import userEvent from "@testing-library/user-event";
import WaitlistSignup from "../WaitlistSignup";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window.gtag for analytics
const mockGtag = jest.fn();
Object.defineProperty(window, "gtag", {
  value: mockGtag,
  writable: true,
});

// Mock URLSearchParams for UTM parameter testing
const mockURLSearchParams = jest.fn();
Object.defineProperty(window, "URLSearchParams", {
  value: mockURLSearchParams,
  writable: true,
});

describe("WaitlistSignup Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    mockGtag.mockClear();

    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn().mockReturnValue(null),
    }));

    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders the basic form elements", () => {
      render(<WaitlistSignup />);

      expect(screen.getByRole("heading", { name: /join the waitlist/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/expected monthly email volume/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/current email provider/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /join waitlist/i })).toBeInTheDocument();
    });

    it("renders in compact mode", () => {
      render(<WaitlistSignup compact />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/current email provider/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/join the waitlist/i)).not.toBeInTheDocument();
    });

    it("pre-fills estimated volume when provided", () => {
      render(<WaitlistSignup estimatedVolume={50000} />);

      const volumeInput = screen.getByLabelText(/expected monthly email volume/i);
      expect(volumeInput).toHaveValue(50000);
    });

    it("applies custom className to the root element", () => {
      const { container } = render(<WaitlistSignup className="custom-class" />);

      const root = container.querySelector(".custom-class");
      expect(root).not.toBeNull();
      // The root wraps the whole component, including the form and privacy note.
      expect(root!.querySelector("form")).not.toBeNull();
      expect(root).toHaveTextContent(/no spam/i);
    });

    it("does not loop on mount (UTM effect runs once)", () => {
      (process.env as Record<string, string>).NODE_ENV = "development";
      render(<WaitlistSignup trackingContext="mount-check" />);

      const viewCalls = (console.log as jest.Mock).mock.calls.filter(
        (c) => c[1] === "waitlist_form_viewed"
      );
      expect(viewCalls).toHaveLength(1);
      expect(mockURLSearchParams).toHaveBeenCalledTimes(1);
    });
  });

  describe("Form Validation", () => {
    it("disables submit until an email is entered", () => {
      render(<WaitlistSignup />);

      expect(screen.getByRole("button", { name: /join waitlist/i })).toBeDisabled();
    });

    it("shows email required error when the form is submitted empty", async () => {
      render(<WaitlistSignup />);

      const form = screen.getByLabelText(/email address/i).closest("form")!;
      fireEvent.submit(form);

      expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("shows email format error for invalid email", async () => {
      const user = userEvent.setup();
      render(<WaitlistSignup />);

      await user.type(screen.getByLabelText(/email address/i), "invalid-email");

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it("clears email error when valid email is entered", async () => {
      const user = userEvent.setup();
      render(<WaitlistSignup />);

      const emailInput = screen.getByLabelText(/email address/i);

      await user.type(emailInput, "invalid");
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });

      await user.clear(emailInput);
      await user.type(emailInput, "test@example.com");

      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
      });
    });

    it("disables submit button when email is invalid", async () => {
      const user = userEvent.setup();
      render(<WaitlistSignup />);

      const submitButton = screen.getByRole("button", { name: /join waitlist/i });
      await user.type(screen.getByLabelText(/email address/i), "invalid-email");

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("Form Submission", () => {
    it("submits form with valid data", async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "Successfully joined the waitlist!",
          data: { id: "test-id", email: "test@example.com", created_at: "2024-01-01T00:00:00Z" },
        }),
      });

      render(<WaitlistSignup onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.type(screen.getByLabelText(/expected monthly email volume/i), "50000");
      await user.type(screen.getByLabelText(/current email provider/i), "Resend");
      await user.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Empty referrer is sent as undefined and dropped by JSON.stringify.
          body: JSON.stringify({
            email: "test@example.com",
            estimatedVolume: 50000,
            currentProvider: "Resend",
          }),
          signal: expect.any(AbortSignal),
        });
      });

      await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled());
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();

      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ ok: true, json: async () => ({ success: true, message: "Success" }) }),
              100
            )
          )
      );

      render(<WaitlistSignup />);

      const submitButton = screen.getByRole("button", { name: /join waitlist/i });
      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.click(submitButton);

      expect(screen.getByText(/joining.../i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await screen.findByText(/you're on the waitlist!/i);
    });

    it("shows success state after successful submission", async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "Successfully joined the waitlist!",
          data: { id: "test-id", email: "test@example.com", created_at: "2024-01-01T00:00:00Z" },
        }),
      });

      render(<WaitlistSignup />);

      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.type(screen.getByLabelText(/expected monthly email volume/i), "25000");
      await user.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(screen.getByText(/you're on the waitlist!/i)).toBeInTheDocument();
        expect(
          screen.getByText(/we'll notify you when the hosted version of baobab mail becomes available/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/expected volume: 25,000 emails\/month/i)).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("shows error message when API returns error", async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, message: "Email already registered for waitlist" }),
      });

      render(<WaitlistSignup />);

      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(screen.getByText(/email already registered for waitlist/i)).toBeInTheDocument();
      });
    });

    it("shows retry button for recoverable errors", async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<WaitlistSignup />);

      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
      });
    });

    it("handles retry functionality", async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<WaitlistSignup />);

      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /try again/i }));

      expect(screen.queryByText(/Network error/i)).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /join waitlist/i })).toBeEnabled();
    });

    it("handles timeout errors", async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new DOMException("The operation was aborted", "AbortError"));

      render(<WaitlistSignup />);

      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(screen.getByText(/request timed out/i)).toBeInTheDocument();
      });
    });
  });

  describe("Analytics Tracking", () => {
    beforeEach(() => {
      (process.env as Record<string, string>).NODE_ENV = "development";
    });

    it("tracks form view on mount", () => {
      render(<WaitlistSignup trackingContext="pricing-page" />);

      expect(console.log).toHaveBeenCalledWith(
        "Analytics Event:",
        "waitlist_form_viewed",
        expect.objectContaining({
          context: "pricing-page",
          has_estimated_volume: false,
          compact_mode: false,
        })
      );
    });

    it("tracks email input interactions", async () => {
      const user = userEvent.setup();
      render(<WaitlistSignup trackingContext="test" />);

      await user.type(screen.getByLabelText(/email address/i), "test@example.com");

      expect(console.log).toHaveBeenCalledWith(
        "Analytics Event:",
        "waitlist_form_email_input",
        expect.objectContaining({ context: "test", has_value: true })
      );
    });

    it("tracks form submission attempts", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "Success" }),
      });

      render(<WaitlistSignup trackingContext="test" />);

      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.click(screen.getByRole("button", { name: /join waitlist/i }));

      expect(console.log).toHaveBeenCalledWith(
        "Analytics Event:",
        "waitlist_form_submit_clicked",
        expect.objectContaining({ context: "test", has_email: true })
      );
      await screen.findByText(/you're on the waitlist!/i);
    });

    it("tracks successful submissions", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "Success",
          data: { id: "test-id", email: "test@example.com", created_at: "2024-01-01T00:00:00Z" },
        }),
      });

      render(<WaitlistSignup trackingContext="test" />);

      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          "Analytics Event:",
          "waitlist_form_submitted_success",
          expect.objectContaining({
            context: "test",
            email_domain: "example.com",
            signup_id: "test-id",
          })
        );
      });
    });

    it("tracks submission errors", async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<WaitlistSignup trackingContext="test" />);

      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          "Analytics Event:",
          "waitlist_form_submitted_error",
          expect.objectContaining({
            context: "test",
            error_type: "api_error",
            error_message: "Network error",
          })
        );
      });
    });

    it("sends events to gtag with captured UTM parameters", () => {
      mockURLSearchParams.mockImplementation(() => ({
        get: (key: string) => ({ utm_source: "google" } as Record<string, string>)[key] ?? null,
      }));

      render(<WaitlistSignup trackingContext="test" />);

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "waitlist_form_viewed",
        expect.objectContaining({ context: "test", utmSource: "google" })
      );
    });
  });

  describe("UTM Parameter Capture", () => {
    it("captures UTM parameters from URL", () => {
      const mockGet = jest.fn().mockReturnValue(null);
      mockURLSearchParams.mockImplementation(() => ({ get: mockGet }));

      render(<WaitlistSignup />);

      expect(mockGet).toHaveBeenCalledWith("utm_source");
      expect(mockGet).toHaveBeenCalledWith("utm_medium");
      expect(mockGet).toHaveBeenCalledWith("utm_campaign");
    });

    it("includes UTM parameters in form submission", async () => {
      const user = userEvent.setup();
      const utm: Record<string, string> = {
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "launch",
      };
      mockURLSearchParams.mockImplementation(() => ({
        get: (key: string) => utm[key] ?? null,
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "Success" }),
      });

      render(<WaitlistSignup />);

      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            utmSource: "google",
            utmMedium: "cpc",
            utmCampaign: "launch",
          }),
          signal: expect.any(AbortSignal),
        });
      });
    });
  });

  describe("Accessibility", () => {
    it("marks the email input as a required email field", () => {
      render(<WaitlistSignup />);

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute("required");
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("associates error messages with inputs", async () => {
      const user = userEvent.setup();
      render(<WaitlistSignup />);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, "invalid");

      await waitFor(() => {
        const message = screen.getByText(/please enter a valid email address/i);
        const messageEl = message.closest("[id]")!;
        expect(messageEl.id).toBeTruthy();
        expect(emailInput.getAttribute("aria-describedby")).toContain(messageEl.id);
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("maintains focus management during state changes", async () => {
      const user = userEvent.setup();
      render(<WaitlistSignup />);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.click(emailInput);

      expect(emailInput).toHaveFocus();
    });
  });
});
