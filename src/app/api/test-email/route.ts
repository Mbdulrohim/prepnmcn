import { NextResponse } from "next/server";
import { sendVerificationEmail } from "../../../lib/email";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET() {
  try {
    console.log("Testing email configuration...");
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_PORT:", process.env.SMTP_PORT);
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("FROM_EMAIL:", process.env.FROM_EMAIL);

    // Test sending an email to the configured email address
    const testEmail = process.env.SMTP_USER || "test@example.com";
    const result = await sendVerificationEmail(testEmail, "123456");

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? "Test email sent successfully!"
        : "Failed to send test email",
      error: result.error || null,
    });
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
      { status: 500 }
    );
  }
}
