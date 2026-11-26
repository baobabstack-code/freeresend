import userEvent from "@testing-library/user-event";
import { renderWithTheme, screen, waitFor } from "@/test-utils/render";
import { Toaster } from "@fluentui/react-components";
import DomainsTab from "../DomainsTab";
import { APP_TOASTER_ID } from "../ui/toast";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: {
    getDomains: jest.fn(),
    addDomain: jest.fn(),
    verifyDomain: jest.fn(),
    deleteDomain: jest.fn(),
    retryDigitalOceanDNS: jest.fn(),
    createSmtpCredentials: jest.fn(),
    deleteSmtpCredentials: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const pending = {
  id: "d1",
  domain: "example.co.zw",
  status: "pending" as const,
  provider: "brevo",
  created_at: "2026-11-26T10:00:00Z",
  dns_records: [
    { type: "TXT", name: "example.co.zw", value: "brevo-code=abc123", ttl: 300, description: "Brevo domain verification" },
  ],
};

const brevo = { name: "brevo" as const, label: "Brevo", smtpMode: "shared" as const };

function setup() {
  return renderWithTheme(
    <>
      <Toaster toasterId={APP_TOASTER_ID} />
      <DomainsTab provider={brevo} />
    </>
  );
}

beforeEach(() => jest.clearAllMocks());

it("lists domains with their status", async () => {
  mockApi.getDomains.mockResolvedValue({ data: { domains: [pending] } });
  setup();
  expect(await screen.findByText("example.co.zw")).toBeInTheDocument();
  expect(screen.getByText("pending")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Verify" })).toBeInTheDocument();
});

it("shows an empty state", async () => {
  mockApi.getDomains.mockResolvedValue({ data: { domains: [] } });
  setup();
  expect(await screen.findByText("No domains yet")).toBeInTheDocument();
});

it("adds a domain and opens its DNS records", async () => {
  mockApi.getDomains.mockResolvedValue({ data: { domains: [] } });
  mockApi.addDomain.mockResolvedValue({ data: { domain: pending } });
  setup();
  await screen.findByText("No domains yet");

  await userEvent.type(screen.getByLabelText(/domain name/i), "Example.co.zw");
  await userEvent.click(screen.getByRole("button", { name: /add domain/i }));

  expect(mockApi.addDomain).toHaveBeenCalledWith("example.co.zw");
  expect(await screen.findByText(/DNS records for example.co.zw/i)).toBeInTheDocument();
  expect(screen.getByText("brevo-code=abc123")).toBeInTheDocument();
});

it("verifies a pending domain", async () => {
  mockApi.getDomains.mockResolvedValue({ data: { domains: [pending] } });
  mockApi.verifyDomain.mockResolvedValue({ data: { status: "verified", verified: true } });
  setup();
  await userEvent.click(await screen.findByRole("button", { name: "Verify" }));
  await waitFor(() => expect(screen.getByText("verified")).toBeInTheDocument());
  expect(mockApi.verifyDomain).toHaveBeenCalledWith("d1");
});
