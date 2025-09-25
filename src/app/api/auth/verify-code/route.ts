import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "../../../../lib/database";
import { EmailCode } from "../../../../entities/EmailCode";
import { User } from "../../../../entities/User";
import { generateToken } from "../../../../lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    // Initialize database if not already
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const emailCodeRepo = AppDataSource.getRepository(EmailCode);
    const userRepo = AppDataSource.getRepository(User);

    // Find and verify the code
    const emailCodeRecord = await emailCodeRepo.findOne({
      where: {
        email: email.toLowerCase(),
        code: code,
        used: false,
      },
      order: { createdAt: "DESC" },
    });

    if (!emailCodeRecord) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    // Check if code is expired
    if (new Date() > emailCodeRecord.expiresAt) {
      return NextResponse.json({ error: "Code has expired" }, { status: 400 });
    }

    // Mark code as used
    emailCodeRecord.used = true;
    await emailCodeRepo.save(emailCodeRecord);

    // Check if user exists
    const existingUser = await userRepo.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Existing user - generate token and login
      const token = generateToken({
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      });

      // Set HTTP-only cookie
      const cookieStore = await cookies();
      cookieStore.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return NextResponse.json({
        success: true,
        isNewUser: false,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          institution: existingUser.institution,
          role: existingUser.role,
          points: existingUser.points,
        },
      });
    } else {
      // New user - just verify code, don't create user yet
      return NextResponse.json({
        success: true,
        isNewUser: true,
      });
    }
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
