import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
// import { User } from "@/entities/User";
// import { Institution } from "@/entities/Institution";

export const runtime = "nodejs";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { getDataSource } = await import("@/lib/database");
    const AppDataSource = await getDataSource();
    const { User } = await import("@/entities/User");
    const { Institution } = await import("@/entities/Institution");

    const userRepo = AppDataSource.getRepository(User);
    const institutionRepo = AppDataSource.getRepository(Institution);
    const body = await request.json();

    if (!body.institutionId) {
      return NextResponse.json(
        { error: "Institution ID is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await userRepo.findOne({
      where: { id: (session.user as any).id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find institution
    const institution = await institutionRepo.findOne({
      where: { id: body.institutionId },
    });

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    // Update user's institution
    user.institution = institution;
    await userRepo.save(user);

    return NextResponse.json({
      success: true,
      message: "Institution updated successfully",
    });
  } catch (error) {
    console.error("Institution update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
