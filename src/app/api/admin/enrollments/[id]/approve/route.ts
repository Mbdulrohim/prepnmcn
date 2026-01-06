import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
// Using auth() instead

import { getDataSource } from "@/lib/database";
import {
  UserProgramEnrollment,
  EnrollmentStatus,
} from "@/entities/UserProgramEnrollment";
import { canManageProgram } from "@/lib/programPermissions";

// PATCH /api/admin/enrollments/[id]/approve - Approve manual payment enrollment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: enrollmentId } = await params;
    const body = await req.json();
    const { notes } = body;

    const dataSource = await getDataSource();
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

    const enrollment = await enrollmentRepo.findOne({
      where: { id: enrollmentId },
      relations: ["program"],
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Check if admin can manage this program
    const canManage = await canManageProgram(
      session.user.id,
      enrollment.programId
    );
    if (!canManage) {
      return NextResponse.json(
        { error: "You don't have permission to approve this enrollment" },
        { status: 403 }
      );
    }

    // Update enrollment status
    enrollment.status = EnrollmentStatus.ACTIVE;
    enrollment.approvedBy = session.user.id;
    enrollment.approvedAt = new Date();
    if (notes) {
      enrollment.notes = notes;
    }

    await enrollmentRepo.save(enrollment);

    // Reload with relations
    const savedEnrollment = await enrollmentRepo.findOne({
      where: { id: enrollmentId },
      relations: ["user", "program"],
    });

    return NextResponse.json({
      success: true,
      enrollment: savedEnrollment,
      message: "Enrollment approved successfully",
    });
  } catch (error) {
    console.error("Error approving enrollment:", error);
    return NextResponse.json(
      { error: "Failed to approve enrollment" },
      { status: 500 }
    );
  }
}
