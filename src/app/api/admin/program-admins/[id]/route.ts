import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
// Using auth() instead

import { getDataSource } from "@/lib/database";
import { ProgramAdmin } from "@/entities/ProgramAdmin";
import { isSuperAdmin } from "@/lib/programPermissions";

// DELETE /api/admin/program-admins/[id] - Remove program admin assignment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super admin can remove program admin assignments
    const isSuper = await isSuperAdmin(session.user.id);
    if (!isSuper) {
      return NextResponse.json(
        { error: "Only super admins can remove program admin assignments" },
        { status: 403 }
      );
    }

    const { id: assignmentId } = await params;

    const dataSource = await getDataSource();
    const programAdminRepo = dataSource.getRepository(ProgramAdmin);

    const assignment = await programAdminRepo.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Soft delete - mark as inactive
    assignment.isActive = false;
    await programAdminRepo.save(assignment);

    return NextResponse.json({
      success: true,
      message: "Program admin assignment removed successfully",
    });
  } catch (error) {
    console.error("Error removing program admin:", error);
    return NextResponse.json(
      { error: "Failed to remove program admin assignment" },
      { status: 500 }
    );
  }
}
