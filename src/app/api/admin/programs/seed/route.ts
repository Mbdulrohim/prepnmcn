import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { isSuperAdmin } from "@/lib/programPermissions";
import { seedDefaultPrograms } from "@/lib/seedPrograms";

export const runtime = "nodejs";

/**
 * POST /api/admin/programs/seed — Manually trigger default program seeding.
 * Safe to call multiple times — only creates programs that don't exist yet.
 * Super admin only.
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuper = await isSuperAdmin(session.user.id);
    if (!isSuper) {
      return NextResponse.json(
        { error: "Only super admins can seed programs" },
        { status: 403 },
      );
    }

    const dataSource = await getDataSource();
    await seedDefaultPrograms(dataSource);

    // Return updated list
    const programRepo = dataSource.getRepository("Program");
    const programs = await programRepo.find({
      order: { createdAt: "ASC" } as any,
    });

    return NextResponse.json({
      success: true,
      message: `Default programs seeded successfully. ${programs.length} program(s) in database.`,
      programs,
    });
  } catch (error) {
    console.error("Error seeding programs:", error);
    return NextResponse.json(
      { error: "Failed to seed programs" },
      { status: 500 },
    );
  }
}
