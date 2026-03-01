import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Program } from "@/entities/Program";
import {
  UserProgramEnrollment,
  EnrollmentStatus,
  PaymentMethod,
} from "@/entities/UserProgramEnrollment";

export const runtime = "nodejs";

// GET /api/user/programs - Get user's program enrollments
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

    const enrollments = await enrollmentRepo.find({
      where: { userId: session.user.id },
      relations: ["program"],
      order: { enrollmentDate: "DESC" },
    });

    const hasAnyEnrollment = enrollments.length > 0;
    const activeEnrollments = enrollments.filter(
      (e) =>
        e.status === EnrollmentStatus.ACTIVE &&
        (!e.expiresAt || new Date() <= new Date(e.expiresAt)),
    );
    const pendingEnrollments = enrollments.filter(
      (e) => e.status === EnrollmentStatus.PENDING_APPROVAL,
    );

    return NextResponse.json({
      success: true,
      hasAnyEnrollment,
      needsProgramSelection: !hasAnyEnrollment,
      enrollments: enrollments.map((e) => ({
        id: e.id,
        programId: e.programId,
        programCode: (e.program as any)?.code,
        programName: (e.program as any)?.name,
        status: e.status,
        paymentMethod: e.paymentMethod,
        expiresAt: e.expiresAt,
        enrollmentDate: e.enrollmentDate,
        isActive:
          e.status === EnrollmentStatus.ACTIVE &&
          (!e.expiresAt || new Date() <= new Date(e.expiresAt)),
      })),
      activePrograms: activeEnrollments.map((e) => ({
        programId: e.programId,
        programCode: (e.program as any)?.code,
        programName: (e.program as any)?.name,
        expiresAt: e.expiresAt,
      })),
      pendingPrograms: pendingEnrollments.map((e) => ({
        programId: e.programId,
        programCode: (e.program as any)?.code,
        programName: (e.program as any)?.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching user programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 },
    );
  }
}

// POST /api/user/programs - Existing user selects a program (creates pending enrollment)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { programCodes } = body;

    if (
      !programCodes ||
      !Array.isArray(programCodes) ||
      programCodes.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one program must be selected" },
        { status: 400 },
      );
    }

    const dataSource = await getDataSource();
    const programRepo = dataSource.getRepository(Program);
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

    const created: string[] = [];
    const alreadyExists: string[] = [];

    for (const code of programCodes) {
      const program = await programRepo.findOne({
        where: { code, isActive: true },
      });

      if (!program) continue;

      // Check if enrollment already exists (any status)
      const existing = await enrollmentRepo.findOne({
        where: { userId: session.user.id, programId: program.id },
      });

      if (existing) {
        alreadyExists.push(code);
        continue;
      }

      const enrollment = enrollmentRepo.create({
        userId: session.user.id,
        programId: program.id,
        paymentMethod: PaymentMethod.MANUAL,
        status: EnrollmentStatus.PENDING_APPROVAL,
        notes: "Selected by user — awaiting payment or admin approval",
      });

      await enrollmentRepo.save(enrollment);
      created.push(code);
    }

    return NextResponse.json({
      success: true,
      created,
      alreadyExists,
      message:
        created.length > 0
          ? `Program selection saved for: ${created.join(", ")}. An admin will review your enrollment or you can pay online for instant access.`
          : "You already have enrollments for the selected programs.",
    });
  } catch (error) {
    console.error("Error selecting programs:", error);
    return NextResponse.json(
      { error: "Failed to select programs" },
      { status: 500 },
    );
  }
}
