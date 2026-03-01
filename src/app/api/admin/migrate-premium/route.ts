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

/**
 * POST /api/admin/migrate-premium
 * Two modes controlled by `mode`:
 *   - "premium" (default): Migrate premium users → active enrollment in target program
 *   - "all-users": Assign ALL users who have NO enrollment in target program → pending enrollment
 * Super admin only. Safe to run multiple times (skips existing enrollments).
 */
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
    const {
      targetProgramCode = ProgramCode.RM,
      targetProgramId,
      dryRun = false,
      mode = "premium", // "premium" | "all-users"
    } = body;

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const programRepo = dataSource.getRepository(Program);
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

    // Find the target program (by ID or code)
    let targetProgram: Program | null = null;
    if (targetProgramId) {
      targetProgram = await programRepo.findOne({
        where: { id: targetProgramId, isActive: true },
      });
    } else {
      targetProgram = await programRepo.findOne({
        where: { code: targetProgramCode, isActive: true },
      });
    }

    if (!targetProgram) {
      return NextResponse.json(
        {
          error: `Program not found (code=${targetProgramCode}, id=${targetProgramId || "none"})`,
        },
        { status: 404 },
      );
    }

    let migrated = 0;
    let skipped = 0;
    const results: Array<{
      userId: string;
      email: string;
      action: string;
    }> = [];

    if (mode === "all-users") {
      // ── Assign ALL users to this program (pending enrollment) ──
      const allUsers = await userRepo.find();

      for (const user of allUsers) {
        // Check if user already has ANY enrollment in the target program
        const existingEnrollment = await enrollmentRepo.findOne({
          where: { userId: user.id, programId: targetProgram.id },
        });

        if (existingEnrollment) {
          skipped++;
          results.push({
            userId: user.id,
            email: user.email,
            action: `skipped — already has enrollment (${existingEnrollment.status})`,
          });
          continue;
        }

        if (!dryRun) {
          // Premium users get ACTIVE, non-premium get PENDING
          const isPremiumUser =
            user.isPremium &&
            (!user.premiumExpiresAt ||
              new Date(user.premiumExpiresAt) > new Date());

          const status = isPremiumUser
            ? EnrollmentStatus.ACTIVE
            : EnrollmentStatus.PENDING_APPROVAL;

          const expiresAt = isPremiumUser
            ? user.premiumExpiresAt &&
              new Date(user.premiumExpiresAt) > new Date()
              ? user.premiumExpiresAt
              : (() => {
                  const d = new Date();
                  d.setMonth(d.getMonth() + 12);
                  return d;
                })()
            : null;

          const enrollment = enrollmentRepo.create({
            userId: user.id,
            programId: targetProgram.id,
            paymentMethod: PaymentMethod.MANUAL,
            status,
            expiresAt,
            approvedBy: isPremiumUser ? session.user.id : undefined,
            approvedAt: isPremiumUser ? new Date() : undefined,
            notes: isPremiumUser
              ? `Migrated from legacy premium on ${new Date().toISOString()}`
              : `Bulk-assigned to ${targetProgram.code} on ${new Date().toISOString()} — pending approval`,
          });

          await enrollmentRepo.save(enrollment);
        }

        migrated++;
        results.push({
          userId: user.id,
          email: user.email,
          action: dryRun ? "would assign" : "assigned",
        });
      }

      return NextResponse.json({
        success: true,
        dryRun,
        mode,
        targetProgram: {
          id: targetProgram.id,
          code: targetProgram.code,
          name: targetProgram.name,
        },
        summary: {
          totalUsers: allUsers.length,
          migrated,
          skipped,
        },
        results: results.slice(0, 100), // Cap results in response
      });
    }

    // ── Default mode: migrate premium users only ──
    const premiumUsers = await userRepo.find({
      where: { isPremium: true },
    });

    for (const user of premiumUsers) {
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
      mode,
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
      results: results.slice(0, 100),
    });
  } catch (error) {
    console.error("Error migrating users:", error);
    return NextResponse.json(
      { error: "Failed to migrate users" },
      { status: 500 },
    );
  }
}
