import { NextRequest, NextResponse } from "next/server";
import { applyEmailEvent, type EmailEventStatus } from "@/lib/email-events";

interface SESMessage {
  eventType: "send" | "delivery" | "bounce" | "complaint" | "reject";
  mail: {
    messageId: string;
    timestamp: string;
    source: string;
    destination: string[];
  };
  delivery?: {
    timestamp: string;
    processingTimeMillis: number;
    recipients: string[];
    smtpResponse: string;
  };
  bounce?: {
    bounceType: string;
    bounceSubType: string;
    bouncedRecipients: Array<{
      emailAddress: string;
      action: string;
      status: string;
      diagnosticCode: string;
    }>;
    timestamp: string;
    feedbackId: string;
  };
  complaint?: {
    complainedRecipients: Array<{
      emailAddress: string;
    }>;
    timestamp: string;
    feedbackId: string;
    complaintFeedbackType: string;
  };
}

async function handleSESWebhook(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle SNS confirmation
    if (body.Type === "SubscriptionConfirmation") {
      console.log("SNS Subscription confirmation received");
      // You would typically confirm the subscription here
      return NextResponse.json({ message: "Subscription confirmed" });
    }

    // Handle SNS notification
    if (body.Type === "Notification") {
      const message: SESMessage = JSON.parse(body.Message);

      await processSESEvent(message);

      return NextResponse.json({ message: "Event processed" });
    }

    return NextResponse.json({ message: "Unknown event type" });
  } catch (error) {
    console.error("SES webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/** Map an SES event to an email status and hand it to the shared event recorder. */
function mapSESEvent(message: SESMessage): {
  status: EmailEventStatus | null;
  errorMessage: string | null;
} {
  switch (message.eventType) {
    case "delivery":
      return { status: "delivered", errorMessage: null };
    case "bounce":
      return {
        status: "bounced",
        errorMessage:
          message.bounce?.bouncedRecipients
            .map((r) => `${r.emailAddress}: ${r.diagnosticCode}`)
            .join("; ") ?? null,
      };
    case "complaint":
      return {
        status: "complained",
        errorMessage: `Complaint from: ${message.complaint?.complainedRecipients
          .map((r) => r.emailAddress)
          .join(", ")}`,
      };
    case "reject":
      return { status: "failed", errorMessage: "Email rejected by SES" };
    default:
      return { status: null, errorMessage: null };
  }
}

async function processSESEvent(message: SESMessage) {
  const { status, errorMessage } = mapSESEvent(message);
  await applyEmailEvent({
    messageId: message.mail.messageId,
    eventType: message.eventType,
    status,
    errorMessage,
    raw: message,
  });
}

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
    const result = await handleSESWebhook(request);
    return cors(result);
  } catch (error) {
    console.error("API Error:", error);
    return cors(NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    ));
  }
}
