import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
// Using auth() instead

import { getDataSource } from "@/lib/database";
import {
  UserProgramEnrollment,
  EnrollmentStatus,
} from "@/entities/UserProgramEnrollment";
import {
  getUserManagedPrograms,
  canManageProgram,
} from "@/lib/programPermissions";
import { getEnrollmentExpiryDate } from "@/lib/enrollmentHelpers";

// GET /api/admin/enrollments - View program enrollments
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const dataSource = await getDataSource();
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

    // Get programs user can manage
    const managedProgramIds = await getUserManagedPrograms(session.user.id);

    if (managedProgramIds.length === 0) {
      return NextResponse.json(
        { error: "You don't have permission to view enrollments" },
        { status: 403 }
      );
    }

    // Build query
    const query = enrollmentRepo
      .createQueryBuilder("enrollment")
      .leftJoinAndSelect("enrollment.user", "user")
      .leftJoinAndSelect("enrollment.program", "program")
      .where("enrollment.programId IN (:...programIds)", {
        programIds: managedProgramIds,
      });

    // Apply filters
    if (programId) {
      query.andWhere("enrollment.programId = :programId", { programId });
    }

    if (userId) {
      query.andWhere("enrollment.userId = :userId", { userId });
    }

    if (status) {
      query.andWhere("enrollment.status = :status", { status });
    }

    query.orderBy("enrollment.enrollmentDate", "DESC");

    const enrollments = await query.getMany();

    return NextResponse.json({ success: true, enrollments });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

// POST /api/admin/enrollments - Manually enroll user in program
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, programId, durationMonths, paymentMethod, notes } = body;

    if (!userId || !programId) {
      return NextResponse.json(
        { error: "userId and programId are required" },
        { status: 400 }
      );
    }

    // Check if admin can manage this program
    const canManage = await canManageProgram(session.user.id, programId);
    if (!canManage) {
      return NextResponse.json(
        { error: "You don't have permission to enroll users in this program" },
        { status: 403 }
      );
    }

    const dataSource = await getDataSource();
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

    // Check if enrollment already exists
    const existing = await enrollmentRepo.findOne({
      where: { userId, programId, status: EnrollmentStatus.ACTIVE },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User is already enrolled in this program" },
        { status: 400 }
      );
    }

    // Calculate expiry date
    const duration = durationMonths || 12;
    const expiresAt = getEnrollmentExpiryDate(duration);

    // Create enrollment
    const enrollment = enrollmentRepo.create({
      userId,
      programId,
      paymentMethod: paymentMethod || "manual",
      status: EnrollmentStatus.ACTIVE,
      expiresAt,
      approvedBy: session.user.id,
      approvedAt: new Date(),
      notes: notes || "Manually enrolled by admin",
    });

    await enrollmentRepo.save(enrollment);

    // Load relations for response
    const savedEnrollment = await enrollmentRepo.findOne({
      where: { id: enrollment.id },
      relations: ["user", "program"],
    });

    return NextResponse.json({
      success: true,
      enrollment: savedEnrollment,
      message: "User enrolled successfully",
    });
  } catch (error) {
    console.error("Error enrolling user:", error);
    return NextResponse.json(
      { error: "Failed to enroll user" },
      { status: 500 }
    );
  }
}
