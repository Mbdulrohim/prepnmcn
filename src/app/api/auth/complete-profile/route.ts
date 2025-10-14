import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";
import { Institution } from "@/entities/Institution";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { email, name, institution } = await request.json();

    if (!email || !name || !institution) {
      return NextResponse.json(
        { error: "Email, name, and institution are required" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);
    const institutionRepo = AppDataSource.getRepository(Institution);

    const existingUser = await userRepo.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.log("User already exists:", email);
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    console.log("Creating new user with email:", email.toLowerCase());

    const institutionEntity = await institutionRepo.findOne({
      where: { name: institution },
    });

    if (!institutionEntity) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 400 }
      );
    }

    const user = userRepo.create({
      email: email.toLowerCase(),
      name: name.trim(),
      institution: institutionEntity,
      role: "student",
      points: 0,
    });

    await userRepo.save(user);

    console.log("New user created successfully:", {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        institution: user.institution?.name || null,
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
