import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/database";
import { User } from "@/entities/User";

export const runtime = "nodejs";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepo = AppDataSource.getRepository(User);
    const body = await request.json();

    // Find user
    const user = await userRepo.findOne({
      where: { id: (session.user as any).id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update academic profile fields
    if (body.academicLevel !== undefined) {
      user.academicLevel = body.academicLevel;
    }

    if (body.selectedCourses !== undefined) {
      user.selectedCourses = body.selectedCourses;
    }

    if (body.studyPreferences !== undefined) {
      user.studyPreferences = body.studyPreferences;
    }

    if (body.notificationSettings !== undefined) {
      user.notificationSettings = body.notificationSettings;
    }

    // Save updated user
    await userRepo.save(user);

    return NextResponse.json({
      success: true,
      message: "Academic profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        academicLevel: user.academicLevel,
        selectedCourses: user.selectedCourses,
        studyPreferences: user.studyPreferences,
        notificationSettings: user.notificationSettings,
      },
    });
  } catch (error) {
    console.error("Error updating academic profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
