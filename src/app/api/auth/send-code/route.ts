import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "../../../../lib/database";
import { EmailCode } from "../../../../entities/EmailCode";
import {
  sendVerificationEmail,
  generateVerificationCode,
} from "../../../../lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Initialize database if not already
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const emailCodeRepo = AppDataSource.getRepository(EmailCode);

    // Generate verification code
    const code = generateVerificationCode();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Save code to database
    const emailCode = emailCodeRepo.create({
      email: email.toLowerCase(),
      code,
      expiresAt,
    });

    await emailCodeRepo.save(emailCode);

    // Send email
    const emailResult = await sendVerificationEmail(email, code);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
