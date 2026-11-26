import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyApiKey } from "@/lib/api-keys";
import { getEmailProvider } from "@/lib/email-provider";
import { parseAddress } from "@/lib/email-provider/brevo";
import { getDomainById } from "@/lib/domains";
import { query } from "@/lib/database";

const attachmentSchema = z.object({
  filename: z.string(),
  content: z.string(), // Base64 encoded
  contentType: z.string().optional(),
});

// Accepts "user@example.com" or "Name <user@example.com>"
const addressSchema = (label: string) =>
  z
    .string()
    .refine((v) => z.string().email().safeParse(parseAddress(v).email).success, {
      message: `Invalid ${label} email`,
    });

// Resend-compatible: a single address or an array of addresses
const addressListSchema = (label: string) =>
  z
    .union([addressSchema(label), z.array(addressSchema(label))])
    .transform((v) => (Array.isArray(v) ? v : [v]));

const sendEmailSchema = z
  .object({
    from: addressSchema("from"),
    to: addressListSchema("to").refine((v) => v.length > 0, {
      message: "At least one recipient is required",
    }),
    cc: addressListSchema("cc").optional(),
    bcc: addressListSchema("bcc").optional(),
    subject: z.string().min(1, "Subject is required"),
    html: z.string().optional(),
    text: z.string().optional(),
    attachments: z.array(attachmentSchema).optional(),
    reply_to: addressListSchema("reply_to").optional(),
    tags: z.record(z.string(), z.string()).optional(),
  })
  .refine((data) => data.html || data.text, {
    message: "Either html or text content is required",
  });

function cors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export async function POST(request: NextRequest) {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return cors(new NextResponse(null, { status: 200 }));
  }

  try {
    // Check authorization (API key required)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return cors(NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      ));
    }

    const apiKeyValue = authHeader.substring(7);
    const apiKey = await verifyApiKey(apiKeyValue);
    if (!apiKey) {
      return cors(NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      ));
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = sendEmailSchema.parse(body);
    
    const {
      from,
      to,
      cc,
      bcc,
      subject,
      html,
      text,
      attachments,
      reply_to,
      tags,
    } = validatedData;

    // Verify the from domain is authorized for this API key
    const domain = await getDomainById(apiKey.domain_id);
    if (!domain) {
      return cors(NextResponse.json({ error: "Domain not found" }, { status: 404 }));
    }

    if (domain.status !== "verified") {
      return cors(NextResponse.json(
        { error: "Domain not verified" },
        { status: 400 }
      ));
    }

    // Validate from email domain
    const fromDomain = parseAddress(from).email.split("@")[1]?.toLowerCase();
    if (fromDomain !== domain.domain.toLowerCase()) {
      return cors(NextResponse.json(
        { error: `From email must be from domain: ${domain.domain}` },
        { status: 400 }
      ));
    }

    // Check API key permissions
    if (!apiKey.permissions.includes("send")) {
      return cors(NextResponse.json(
        { error: "API key does not have send permission" },
        { status: 403 }
      ));
    }


    // Convert attachments to match EmailAttachment interface
    const sesAttachments = attachments?.map(att => ({
      filename: att.filename,
      content: att.content,
      contentType: att.contentType || 'application/octet-stream'
    }));

    const provider = getEmailProvider();

    const logEmail = async (
      status: "sent" | "failed",
      messageId: string | null,
      errorMessage: string | null
    ) => {
      try {
        const result = await query(
          `INSERT INTO email_logs (
            api_key_id, domain_id, from_email, to_emails, cc_emails, bcc_emails,
            subject, html_content, text_content, attachments, status,
            message_id, ses_message_id, provider, error_message
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING *`,
          [
            apiKey.id,
            domain.id,
            from,
            JSON.stringify(to),
            JSON.stringify(cc || []),
            JSON.stringify(bcc || []),
            subject,
            html,
            text,
            JSON.stringify(attachments || []),
            status,
            messageId,
            provider.name === "ses" ? messageId : null,
            provider.name,
            errorMessage,
          ]
        );
        return result.rows[0];
      } catch (logError) {
        console.error("Failed to log email:", logError);
        return null;
      }
    };

    let messageId: string;
    try {
      messageId = await provider.sendEmail({
        from,
        to,
        cc,
        bcc,
        subject: subject || "",
        html,
        text,
        attachments: sesAttachments,
        replyTo: reply_to,
        tags,
      });
    } catch (sendError) {
      const reason = sendError instanceof Error ? sendError.message : String(sendError);
      console.error(`${provider.label} send failed:`, sendError);
      const failedLog = await logEmail("failed", null, reason);
      return cors(NextResponse.json(
        {
          error: `Failed to send email via ${provider.label}`,
          details: reason,
          id: failedLog?.id,
        },
        { status: 502 }
      ));
    }

    const emailLog = await logEmail("sent", messageId, null);

    return cors(NextResponse.json({
      id: emailLog?.id || messageId,
      from,
      to,
      created_at: new Date().toISOString(),
    }));
  } catch (error: unknown) {
    // Handle validation errors
    const errorObj = error as { errors?: unknown; message?: string };
    if (errorObj.errors || errorObj.message?.includes('validation') || errorObj.message?.includes('parse')) {
      return cors(NextResponse.json(
        {
          error: "Invalid request data",
          details: errorObj.errors || errorObj.message,
        },
        { status: 400 }
      ));
    }

    console.error("API Error:", error);
    return cors(NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    ));
  }
}