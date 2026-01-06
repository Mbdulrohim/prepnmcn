import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
// Using auth() instead

import { getDataSource } from "@/lib/database";
import { ProgramAdmin } from "@/entities/ProgramAdmin";
import { User } from "@/entities/User";
import { isSuperAdmin } from "@/lib/programPermissions";

// GET /api/admin/program-admins - List program admin assignments
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super admin can view program admin assignments
    const isSuper = await isSuperAdmin(session.user.id);
    if (!isSuper) {
      return NextResponse.json(
        { error: "Only super admins can view program admin assignments" },
        { status: 403 }
      );
    }

    const dataSource = await getDataSource();
    const programAdminRepo = dataSource.getRepository(ProgramAdmin);

    const assignments = await programAdminRepo.find({
      relations: ["user", "program"],
      order: { createdAt: "DESC" },
    });

    return NextResponse.json({ success: true, assignments });
  } catch (error) {
    console.error("Error fetching program admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch program admin assignments" },
      { status: 500 }
    );
  }
}

// POST /api/admin/program-admins - Assign admin to program
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super admin can assign program admins
    const isSuper = await isSuperAdmin(session.user.id);
    if (!isSuper) {
      return NextResponse.json(
        { error: "Only super admins can assign program admins" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, programId } = body;

    if (!userId || !programId) {
      return NextResponse.json(
        { error: "userId and programId are required" },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const programAdminRepo = dataSource.getRepository(ProgramAdmin);

    // Verify user exists
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if assignment already exists
    const existing = await programAdminRepo.findOne({
      where: { userId, programId },
    });

    if (existing) {
      // Reactivate if it exists but is inactive
      if (!existing.isActive) {
        existing.isActive = true;
        existing.assignedBy = session.user.id;
        existing.assignedAt = new Date();
        await programAdminRepo.save(existing);

        return NextResponse.json({
          success: true,
          assignment: existing,
          message: "Program admin assignment reactivated",
        });
      }

      return NextResponse.json(
        { error: "This user is already assigned to this program" },
        { status: 400 }
      );
    }

    // Create new assignment
    const assignment = programAdminRepo.create({
      userId,
      programId,
      assignedBy: session.user.id,
      assignedAt: new Date(),
      isActive: true,
    });

    await programAdminRepo.save(assignment);

    // Load relations for response
    const savedAssignment = await programAdminRepo.findOne({
      where: { id: assignment.id },
      relations: ["user", "program"],
    });

    return NextResponse.json({
      success: true,
      assignment: savedAssignment,
      message: "Program admin assigned successfully",
    });
  } catch (error) {
    console.error("Error assigning program admin:", error);
    return NextResponse.json(
      { error: "Failed to assign program admin" },
      { status: 500 }
    );
  }
}
