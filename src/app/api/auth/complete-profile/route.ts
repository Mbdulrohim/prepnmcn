import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "../../../../lib/database";
import { User } from "../../../../entities/User";
import { generateToken } from "../../../../lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, name, institution } = await request.json();

    if (!email || !name || !institution) {
      return NextResponse.json(
        { error: "Email, name, and institution are required" },
        { status: 400 }
      );
    }

    // Initialize database if not already
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepo = AppDataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepo.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const user = userRepo.create({
      email: email.toLowerCase(),
      name: name.trim(),
      institution: institution.toUpperCase().trim(),
      role: "student",
      points: 0,
    });

    await userRepo.save(user);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        institution: user.institution,
        role: user.role,
        points: user.points,
      },
    });
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
