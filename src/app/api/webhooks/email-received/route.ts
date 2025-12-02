import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDataSource } from "@/lib/database";
import { Email } from "@/entities/Email";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("X-Webhook-Signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const rawBody = await req.text();

    if (!process.env.WEBHOOK_SECRET) {
      console.error("WEBHOOK_SECRET is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify signature
    const hmac = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET);
    const calculatedSignature = hmac.update(rawBody).digest("hex");

    if (signature !== calculatedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    const dataSource = await getDataSource();
    const emailRepository = dataSource.getRepository(Email);

    // Check if email already exists (idempotency)
    const existingEmail = await emailRepository.findOne({
      where: { messageId: body.messageId },
    });

    if (existingEmail) {
      return NextResponse.json({ message: "Email already processed" });
    }

    const email = new Email();
    email.messageId = body.messageId;
    email.from = body.from;
    email.to = body.to;
    email.subject = body.subject;
    email.textBody = body.text;
    email.htmlBody = body.html;
    email.attachments = body.attachments;
    email.receivedAt = new Date(body.date);
    email.folder = "inbox";

    await emailRepository.save(email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing email webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
