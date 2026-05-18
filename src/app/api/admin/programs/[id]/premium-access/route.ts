import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Program } from "@/entities/Program";
import {
  EnrollmentStatus,
  PaymentMethod,
  UserProgramEnrollment,
} from "@/entities/UserProgramEnrollment";
import { canManageProgram } from "@/lib/programPermissions";
import {
  calculatePremiumExpiry,
  syncLegacyPremiumState,
} from "@/lib/premiumAccess";

export const runtime = "nodejs";

function ensureAdmin(
  session:
    | {
        user?: {
          role?: string | null;
        } | null;
      }
    | null
    | undefined,
) {
  return (
    session?.user &&
    ["admin", "super_admin"].includes((session.user as any).role)
  );
}

// POST - Grant access to every user already registered in a program
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!ensureAdmin(session)) {
      return NextResponse.json(
        { message: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    const { id: programId } = await params;
    const body = await request.json();
    const { durationDays = 30, durationMonths } = body;

    const dataSource = await getDataSource();
    const programRepo = dataSource.getRepository(Program);
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

    const program = await programRepo.findOne({ where: { id: programId } });
    if (!program) {
      return NextResponse.json(
        { message: "Program not found" },
        { status: 404 },
      );
    }

    const canManage = await canManageProgram(
      (session!.user as any).id,
      program.id,
    );
    if (!canManage) {
      return NextResponse.json(
        {
          message: `You don't have permission to grant premium access for ${program.name}.`,
        },
        { status: 403 },
      );
    }

    const enrollments = await enrollmentRepo.find({
      where: { programId: program.id },
      order: { updatedAt: "DESC", enrollmentDate: "DESC" },
    });

    const uniqueEnrollments = new Map<string, UserProgramEnrollment>();
    for (const enrollment of enrollments) {
      if (!uniqueEnrollments.has(enrollment.userId)) {
        uniqueEnrollments.set(enrollment.userId, enrollment);
      }
    }

    if (uniqueEnrollments.size === 0) {
      return NextResponse.json({
        message: `No registered users found for ${program.name}.`,
        program: {
          id: program.id,
          code: program.code,
          name: program.name,
        },
        totalRegistered: 0,
        grantedCount: 0,
      });
    }

    const expiresAt = calculatePremiumExpiry({
      durationDays,
      durationMonths,
    });
    const adminId = (session!.user as any).id;
    const note = `Bulk premium access granted by admin for ${durationMonths ? `${durationMonths} month(s)` : `${durationDays} day(s)`}`;

    for (const enrollment of uniqueEnrollments.values()) {
      enrollment.status = EnrollmentStatus.ACTIVE;
      enrollment.expiresAt = expiresAt;
      enrollment.approvedBy = adminId;
      enrollment.approvedAt = new Date();
      enrollment.paymentMethod = PaymentMethod.MANUAL;
      enrollment.notes = note;
    }

    await enrollmentRepo.save([...uniqueEnrollments.values()]);

    for (const userId of uniqueEnrollments.keys()) {
      await syncLegacyPremiumState(dataSource, userId);
    }

    return NextResponse.json({
      message: `Granted ${program.code} access to ${uniqueEnrollments.size} registered user${uniqueEnrollments.size === 1 ? "" : "s"}.`,
      program: {
        id: program.id,
        code: program.code,
        name: program.name,
      },
      totalRegistered: uniqueEnrollments.size,
      grantedCount: uniqueEnrollments.size,
      expiresAt,
    });
  } catch (error) {
    console.error("Error granting bulk program premium access:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Revoke access for every active user in a program
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!ensureAdmin(session)) {
      return NextResponse.json(
        { message: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    const { id: programId } = await params;
    const dataSource = await getDataSource();
    const programRepo = dataSource.getRepository(Program);
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

    const program = await programRepo.findOne({ where: { id: programId } });
    if (!program) {
      return NextResponse.json(
        { message: "Program not found" },
        { status: 404 },
      );
    }

    const canManage = await canManageProgram(
      (session!.user as any).id,
      program.id,
    );
    if (!canManage) {
      return NextResponse.json(
        {
          message: `You don't have permission to revoke premium access for ${program.name}.`,
        },
        { status: 403 },
      );
    }

    const activeEnrollments = await enrollmentRepo.find({
      where: { programId: program.id, status: EnrollmentStatus.ACTIVE },
    });

    if (activeEnrollments.length === 0) {
      return NextResponse.json({
        message: `No active ${program.code} access found to revoke.`,
        program: {
          id: program.id,
          code: program.code,
          name: program.name,
        },
        revokedCount: 0,
      });
    }

    const affectedUserIds = new Set<string>();
    const note = `Bulk access revoked by admin on ${new Date().toISOString()}`;

    for (const enrollment of activeEnrollments) {
      enrollment.status = EnrollmentStatus.REVOKED;
      enrollment.notes = note;
      affectedUserIds.add(enrollment.userId);
    }

    await enrollmentRepo.save(activeEnrollments);

    for (const userId of affectedUserIds) {
      await syncLegacyPremiumState(dataSource, userId);
    }

    return NextResponse.json({
      message: `Revoked ${program.code} access for ${affectedUserIds.size} user${affectedUserIds.size === 1 ? "" : "s"}.`,
      program: {
        id: program.id,
        code: program.code,
        name: program.name,
      },
      revokedCount: affectedUserIds.size,
    });
  } catch (error) {
    console.error("Error revoking bulk program premium access:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
