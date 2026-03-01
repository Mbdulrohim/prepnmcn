import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";
import { Program } from "@/entities/Program";
import {
  UserProgramEnrollment,
  EnrollmentStatus,
  PaymentMethod,
} from "@/entities/UserProgramEnrollment";
import { canManageProgram, isSuperAdmin } from "@/lib/programPermissions";

export const runtime = "nodejs";

// POST - Grant premium access to a specific program
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["admin", "super_admin"].includes((session.user as any).role)
    ) {
      return NextResponse.json(
        { message: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { programId, programCode, durationDays = 30, durationMonths } = body;

    // Resolve program
    const dataSource = await getDataSource();
    const programRepo = dataSource.getRepository(Program);
    let program: Program | null = null;

    if (programId) {
      program = await programRepo.findOne({ where: { id: programId } });
    } else if (programCode) {
      program = await programRepo.findOne({ where: { code: programCode } });
    }

    if (!program) {
      return NextResponse.json(
        { message: "Program is required. Provide programId or programCode." },
        { status: 400 },
      );
    }

    // Check if admin can manage this program
    const canManage = await canManageProgram(
      (session.user as any).id,
      program.id,
    );
    if (!canManage) {
      return NextResponse.json(
        {
          message: `You don't have permission to grant premium access for ${program.name}. Only ${program.code} admins and super admins can do this.`,
        },
        { status: 403 },
      );
    }

    const userRepo = dataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Calculate expiration date
    const now = new Date();
    const expiresAt = new Date(now);

    if (durationMonths) {
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths);
    } else {
      expiresAt.setDate(expiresAt.getDate() + durationDays);
    }

    // Create or reactivate program enrollment
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

    // Check for existing enrollment
    let enrollment = await enrollmentRepo.findOne({
      where: { userId, programId: program.id },
    });

    if (enrollment) {
      // Reactivate or extend existing enrollment
      enrollment.status = EnrollmentStatus.ACTIVE;
      enrollment.expiresAt = expiresAt;
      enrollment.approvedBy = (session.user as any).id;
      enrollment.approvedAt = new Date();
      enrollment.paymentMethod = PaymentMethod.MANUAL;
      enrollment.notes = `Premium access granted by admin for ${durationMonths ? `${durationMonths} month(s)` : `${durationDays} day(s)`}`;
    } else {
      // Create new enrollment
      enrollment = enrollmentRepo.create({
        userId,
        programId: program.id,
        paymentMethod: PaymentMethod.MANUAL,
        status: EnrollmentStatus.ACTIVE,
        expiresAt,
        approvedBy: (session.user as any).id,
        approvedAt: new Date(),
        notes: `Premium access granted by admin for ${durationMonths ? `${durationMonths} month(s)` : `${durationDays} day(s)`}`,
      });
    }

    await enrollmentRepo.save(enrollment);

    // Also sync the legacy isPremium flag for backward compatibility
    user.isPremium = true;
    if (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) < expiresAt) {
      user.premiumExpiresAt = expiresAt;
    }
    await userRepo.save(user);

    return NextResponse.json({
      message: `User granted premium access for ${program.name} (${durationMonths ? `${durationMonths} month(s)` : `${durationDays} day(s)`})`,
      enrollment: {
        id: enrollment.id,
        programId: program.id,
        programCode: program.code,
        programName: program.name,
        status: enrollment.status,
        expiresAt: enrollment.expiresAt,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
      },
    });
  } catch (error) {
    console.error("Error granting program premium access:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Revoke premium access for a specific program
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["admin", "super_admin"].includes((session.user as any).role)
    ) {
      return NextResponse.json(
        { message: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    const { id: userId } = await params;

    // Parse programId from query string
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");

    const dataSource = await getDataSource();
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);
    const userRepo = dataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (programId) {
      // Revoke for specific program — check admin permission
      const canManage = await canManageProgram(
        (session.user as any).id,
        programId,
      );
      if (!canManage) {
        return NextResponse.json(
          {
            message:
              "You don't have permission to revoke access for this program",
          },
          { status: 403 },
        );
      }

      const enrollment = await enrollmentRepo.findOne({
        where: { userId, programId, status: EnrollmentStatus.ACTIVE },
      });

      if (enrollment) {
        enrollment.status = EnrollmentStatus.REVOKED;
        enrollment.notes = `Revoked by admin on ${new Date().toISOString()}`;
        await enrollmentRepo.save(enrollment);
      }

      // Check if user has any remaining active enrollments
      const remainingActive = await enrollmentRepo.count({
        where: { userId, status: EnrollmentStatus.ACTIVE },
      });

      if (remainingActive === 0) {
        user.isPremium = false;
        user.premiumExpiresAt = null;
        await userRepo.save(user);
      }

      return NextResponse.json({
        message: "Program premium access revoked",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isPremium: user.isPremium,
        },
      });
    } else {
      // Only super admin can revoke ALL premium
      const isSuper = await isSuperAdmin((session.user as any).id);
      if (!isSuper) {
        return NextResponse.json(
          {
            message:
              "Only super admins can revoke all premium access. Specify a programId to revoke for a specific program.",
          },
          { status: 403 },
        );
      }

      // Revoke all program enrollments
      const activeEnrollments = await enrollmentRepo.find({
        where: { userId, status: EnrollmentStatus.ACTIVE },
      });

      for (const enrollment of activeEnrollments) {
        enrollment.status = EnrollmentStatus.REVOKED;
        enrollment.notes = `All access revoked by super admin on ${new Date().toISOString()}`;
        await enrollmentRepo.save(enrollment);
      }

      user.isPremium = false;
      user.premiumExpiresAt = null;
      await userRepo.save(user);

      return NextResponse.json({
        message: "All premium access revoked",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isPremium: user.isPremium,
          premiumExpiresAt: user.premiumExpiresAt,
        },
      });
    }
  } catch (error) {
    console.error("Error revoking premium status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
