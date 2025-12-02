import crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

const WEBHOOK_URL = "http://localhost:3000/api/webhooks/email-received";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET as string;

if (!WEBHOOK_SECRET) {
  console.error("WEBHOOK_SECRET not found in .env");
  process.exit(1);
}

async function testWebhook() {
  const payload = {
    messageId: `test-${Date.now()}`,
    from: "sender@example.com",
    to: ["recipient@prepnmcn.com"],
    subject: "Test Email from Script",
    text: "This is a test email body.",
    html: "<p>This is a test email body.</p>",
    date: new Date().toISOString(),
    attachments: [],
  };

  const rawBody = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const signature = hmac.update(rawBody).digest("hex");

  console.log("Sending webhook request...");
  console.log("Payload:", payload);
  console.log("Signature:", signature);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
      },
      body: rawBody,
    });

    console.log("Response status:", response.status);
    const text = await response.text();
    console.log("Response text:", text);

    try {
      const data = JSON.parse(text);
      console.log("Response body:", data);
    } catch (e) {
      console.log("Response is not JSON");
    }
  } catch (error) {
    console.error("Error sending webhook:", error);
  }
}

testWebhook();
