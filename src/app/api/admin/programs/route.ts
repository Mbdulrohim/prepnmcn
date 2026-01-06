import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
// Using auth() instead

import { getDataSource } from "@/lib/database";
import { Program } from "@/entities/Program";
import { isSuperAdmin, getUserManagedPrograms } from "@/lib/programPermissions";

// GET /api/admin/programs - List programs
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const programRepo = dataSource.getRepository(Program);

    // Check if user is super admin
    const isSuper = await isSuperAdmin(session.user.id);

    if (isSuper) {
      // Super admin sees all programs
      const programs = await programRepo.find({
        order: { metadata: "ASC" }, // Sort by displayOrder in metadata
      });

      // Get enrollment counts for each program
      const programsWithCounts = await Promise.all(
        programs.map(async (program) => {
          const enrollmentCount = await dataSource
            .getRepository("UserProgramEnrollment")
            .count({
              where: { programId: program.id, status: "active" },
            });

          return {
            ...program,
            enrollmentCount,
          };
        })
      );

      return NextResponse.json({ success: true, programs: programsWithCounts });
    } else {
      // Program admin sees only their assigned programs
      const managedProgramIds = await getUserManagedPrograms(session.user.id);

      if (managedProgramIds.length === 0) {
        return NextResponse.json(
          { error: "You are not assigned to manage any programs" },
          { status: 403 }
        );
      }

      const programs = await programRepo
        .createQueryBuilder("program")
        .where("program.id IN (:...ids)", { ids: managedProgramIds })
        .getMany();

      // Get enrollment counts
      const programsWithCounts = await Promise.all(
        programs.map(async (program) => {
          const enrollmentCount = await dataSource
            .getRepository("UserProgramEnrollment")
            .count({
              where: { programId: program.id, status: "active" },
            });

          return {
            ...program,
            enrollmentCount,
          };
        })
      );

      return NextResponse.json({ success: true, programs: programsWithCounts });
    }
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/programs - Create new program (super admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super admin can create programs
    const isSuper = await isSuperAdmin(session.user.id);
    if (!isSuper) {
      return NextResponse.json(
        { error: "Only super admins can create programs" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { code, name, description, price, durationMonths, metadata } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: "Code and name are required" },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const programRepo = dataSource.getRepository(Program);

    // Check if program code already exists
    const existing = await programRepo.findOne({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "Program with this code already exists" },
        { status: 400 }
      );
    }

    const program = programRepo.create({
      code,
      name,
      description,
      price,
      durationMonths: durationMonths || 12,
      metadata,
      isActive: true,
    });

    await programRepo.save(program);

    return NextResponse.json({
      success: true,
      program,
      message: "Program created successfully",
    });
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    );
  }
}
