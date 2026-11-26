/**
 * @jest-environment node
 */
import {
  brevoProvider,
  buildSendPayload,
  mapBrevoDnsRecords,
  parseAddress,
} from "../email-provider/brevo";
import { mapBrevoEvent, tokensMatch } from "../email-provider/brevo-events";
import { getEmailProvider, getProviderName } from "../email-provider";

const fetchMock = jest.fn();

function respond(status: number, body: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    text: () => Promise.resolve(body === undefined ? "" : JSON.stringify(body)),
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
  process.env.BREVO_API_KEY = "test-key";
});

afterEach(() => {
  delete process.env.BREVO_API_KEY;
  delete process.env.EMAIL_PROVIDER;
});

describe("parseAddress", () => {
  it("parses a bare address", () => {
    expect(parseAddress("a@x.com")).toEqual({ email: "a@x.com" });
  });
  it("parses a display name", () => {
    expect(parseAddress("Baobab Mail <hi@x.com>")).toEqual({ name: "Baobab Mail", email: "hi@x.com" });
  });
  it("parses a quoted display name", () => {
    expect(parseAddress('"Ops, Team" <ops@x.com>')).toEqual({ name: "Ops, Team", email: "ops@x.com" });
  });
});

describe("buildSendPayload", () => {
  it("maps our options to Brevo's request body", () => {
    expect(
      buildSendPayload({
        from: "Shop <shop@x.com>",
        to: ["a@y.com"],
        cc: ["c@y.com"],
        bcc: ["b@y.com"],
        subject: "Hi",
        html: "<p>Hi</p>",
        text: "Hi",
        replyTo: ["reply@x.com", "ignored@x.com"],
        attachments: [{ filename: "a.pdf", content: "QUJD", contentType: "application/pdf" }],
        tags: { type: "receipt" },
      })
    ).toEqual({
      sender: { name: "Shop", email: "shop@x.com" },
      to: [{ email: "a@y.com" }],
      cc: [{ email: "c@y.com" }],
      bcc: [{ email: "b@y.com" }],
      subject: "Hi",
      htmlContent: "<p>Hi</p>",
      textContent: "Hi",
      replyTo: { email: "reply@x.com" },
      attachment: [{ name: "a.pdf", content: "QUJD" }],
      tags: ["type:receipt"],
    });
  });

  it("omits empty optional fields", () => {
    const payload = buildSendPayload({ from: "a@x.com", to: ["b@y.com"], subject: "S", text: "T" });
    expect(Object.keys(payload).sort()).toEqual(["sender", "subject", "textContent", "to"]);
  });
});

describe("mapBrevoDnsRecords", () => {
  it("turns Brevo's records into fully qualified DNS records", () => {
    const records = mapBrevoDnsRecords("example.com", {
      brevo_code: { host_name: "@", type: "TXT", value: "brevo-code=abc", status: false },
      dkim_record: { host_name: "mail._domainkey", type: "TXT", value: "k=rsa;p=xyz", status: true },
      dmarc_record: { host_name: "_dmarc", type: "TXT", value: "v=DMARC1; p=none", status: false },
    });
    expect(records).toEqual([
      { type: "TXT", name: "example.com", value: "brevo-code=abc", ttl: 300, description: "Brevo domain verification" },
      { type: "TXT", name: "mail._domainkey.example.com", value: "k=rsa;p=xyz", ttl: 300, description: "DKIM signature (found)" },
      { type: "TXT", name: "_dmarc.example.com", value: "v=DMARC1; p=none", ttl: 300, description: "DMARC policy" },
    ]);
  });

  it("returns [] when there are no records", () => {
    expect(mapBrevoDnsRecords("example.com", undefined)).toEqual([]);
  });
});

describe("brevoProvider", () => {
  it("sends and returns the message ID", async () => {
    fetchMock.mockReturnValueOnce(respond(201, { messageId: "<123@relay>" }));
    const id = await brevoProvider.sendEmail({ from: "a@x.com", to: ["b@y.com"], subject: "S", text: "T" });
    expect(id).toBe("<123@relay>");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(init.method).toBe("POST");
    expect(init.headers["api-key"]).toBe("test-key");
  });

  it("surfaces Brevo's error message", async () => {
    fetchMock.mockReturnValueOnce(respond(400, { code: "invalid_parameter", message: "sender is invalid" }));
    await expect(
      brevoProvider.sendEmail({ from: "a@x.com", to: ["b@y.com"], subject: "S", text: "T" })
    ).rejects.toThrow("sender is invalid");
  });

  it("requires BREVO_API_KEY", async () => {
    delete process.env.BREVO_API_KEY;
    await expect(
      brevoProvider.sendEmail({ from: "a@x.com", to: ["b@y.com"], subject: "S", text: "T" })
    ).rejects.toThrow("BREVO_API_KEY");
  });

  it("falls back to the existing configuration when the domain was already added", async () => {
    fetchMock
      .mockReturnValueOnce(respond(400, { code: "invalid_parameter", message: "Domain already exists in your account" }))
      .mockReturnValueOnce(
        respond(200, {
          domain: "example.com",
          verified: false,
          authenticated: false,
          dns_records: { brevo_code: { host_name: "@", type: "TXT", value: "brevo-code=abc", status: false } },
        })
      );
    const setup = await brevoProvider.setupDomain("example.com");
    expect(setup.dnsRecords).toHaveLength(1);
    expect(fetchMock.mock.calls[1][0]).toBe("https://api.brevo.com/v3/senders/domains/example.com");
  });

  it("reports verified when the domain is authenticated", async () => {
    fetchMock.mockReturnValueOnce(respond(200, { domain: "example.com", authenticated: true }));
    await expect(brevoProvider.checkDomainStatus("example.com")).resolves.toBe("verified");
  });

  it("asks Brevo to authenticate, and stays pending if DNS isn't ready", async () => {
    fetchMock
      .mockReturnValueOnce(respond(200, { domain: "example.com", authenticated: false }))
      .mockReturnValueOnce(respond(400, { code: "invalid_parameter", message: "DNS records not properly configured" }));
    await expect(brevoProvider.checkDomainStatus("example.com")).resolves.toBe("pending");
    expect(fetchMock.mock.calls[1][1].method).toBe("PUT");
  });
});

describe("mapBrevoEvent", () => {
  it.each([
    ["delivered", "delivered"],
    ["hard_bounce", "bounced"],
    ["soft_bounce", "bounced"],
    ["spam", "complained"],
    ["blocked", "failed"],
    ["invalid_email", "failed"],
    ["error", "failed"],
    ["opened", null],
    ["deferred", null],
  ])("maps %s to %s", (event, status) => {
    expect(mapBrevoEvent({ event, "message-id": "<m1>", email: "a@y.com" })?.status).toBe(status);
  });

  it("puts the bounce reason in the error message", () => {
    expect(
      mapBrevoEvent({ event: "hard_bounce", "message-id": "<m1>", email: "a@y.com", reason: "mailbox full" })
        ?.errorMessage
    ).toBe("a@y.com: mailbox full");
  });

  it("ignores payloads without a message ID", () => {
    expect(mapBrevoEvent({ event: "delivered" })).toBeNull();
  });
});

describe("tokensMatch", () => {
  it("matches only the exact secret", () => {
    expect(tokensMatch("s3cret", "s3cret")).toBe(true);
    expect(tokensMatch("s3creT", "s3cret")).toBe(false);
    expect(tokensMatch(null, "s3cret")).toBe(false);
    expect(tokensMatch("s3cret", undefined)).toBe(false);
  });
});

describe("getEmailProvider", () => {
  it("defaults to SES", () => {
    expect(getProviderName()).toBe("ses");
    expect(getEmailProvider().name).toBe("ses");
  });
  it("selects Brevo", () => {
    process.env.EMAIL_PROVIDER = "Brevo";
    expect(getEmailProvider().name).toBe("brevo");
  });
});
