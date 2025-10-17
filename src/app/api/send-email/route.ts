import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// only print that SMTP credentials exist (don't log secrets)
console.log("SMTP_USER set:", !!process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  requireTLS: process.env.SMTP_PORT !== "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 10,
});

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, from } = await req.json();

    // prefer explicit `from` -> login notification from -> smtp from
    const fromAddress =
      from ||
      process.env.LOGIN_NOTIFICATION_FROM_EMAIL ||
      process.env.SMTP_FROM_EMAIL ||
      process.env.SMTP_FROM ||
      "noreply@prepnmcn.com";

    // basic validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromAddress)) {
      console.error("Invalid from address provided:", fromAddress);
      return NextResponse.json({ error: "Invalid from address" }, { status: 400 });
    }

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email sending failed:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        code: (error as Error & { code?: string | number }).code,
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
