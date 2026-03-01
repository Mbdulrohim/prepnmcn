import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";
import { Program, ProgramCode } from "@/entities/Program";
import {
  UserProgramEnrollment,
  EnrollmentStatus,
  PaymentMethod,
} from "@/entities/UserProgramEnrollment";
import { isSuperAdmin } from "@/lib/programPermissions";

export const runtime = "nodejs";

// POST /api/admin/migrate-premium - Migrate existing premium users to RM program
// Super admin only
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuper = await isSuperAdmin(session.user.id);
    if (!isSuper) {
      return NextResponse.json(
        { error: "Only super admins can run migrations" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { targetProgramCode = ProgramCode.RM, dryRun = false } = body;

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const programRepo = dataSource.getRepository(Program);
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

    // Find the target program
    const targetProgram = await programRepo.findOne({
      where: { code: targetProgramCode, isActive: true },
    });

    if (!targetProgram) {
      return NextResponse.json(
        { error: `Program ${targetProgramCode} not found` },
        { status: 404 },
      );
    }

    // Find all premium users
    const premiumUsers = await userRepo.find({
      where: { isPremium: true },
    });

    let migrated = 0;
    let skipped = 0;
    const results: Array<{
      userId: string;
      email: string;
      action: string;
    }> = [];

    for (const user of premiumUsers) {
      // Check if user already has an active enrollment in the target program
      const existingEnrollment = await enrollmentRepo.findOne({
        where: {
          userId: user.id,
          programId: targetProgram.id,
          status: EnrollmentStatus.ACTIVE,
        },
      });

      if (existingEnrollment) {
        skipped++;
        results.push({
          userId: user.id,
          email: user.email,
          action: "skipped — already enrolled",
        });
        continue;
      }

      if (!dryRun) {
        // Create active enrollment preserving their premium expiry
        const expiresAt =
          user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date()
            ? user.premiumExpiresAt
            : (() => {
                const d = new Date();
                d.setMonth(d.getMonth() + 12);
                return d;
              })();

        const enrollment = enrollmentRepo.create({
          userId: user.id,
          programId: targetProgram.id,
          paymentMethod: PaymentMethod.MANUAL,
          status: EnrollmentStatus.ACTIVE,
          expiresAt,
          approvedBy: session.user.id,
          approvedAt: new Date(),
          notes: `Migrated from legacy premium access on ${new Date().toISOString()}`,
        });

        await enrollmentRepo.save(enrollment);
      }

      migrated++;
      results.push({
        userId: user.id,
        email: user.email,
        action: dryRun ? "would migrate" : "migrated",
      });
    }

    return NextResponse.json({
      success: true,
      dryRun,
      targetProgram: {
        id: targetProgram.id,
        code: targetProgram.code,
        name: targetProgram.name,
      },
      summary: {
        totalPremiumUsers: premiumUsers.length,
        migrated,
        skipped,
      },
      results,
    });
  } catch (error) {
    console.error("Error migrating premium users:", error);
    return NextResponse.json(
      { error: "Failed to migrate premium users" },
      { status: 500 },
    );
  }
}
