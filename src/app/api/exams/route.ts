import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam, ExamStatus } from "@/entities/Exam";
import { User } from "@/entities/User";
import { getUserActiveEnrollments } from "@/lib/enrollmentHelpers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userRole = (session.user as any)?.role;
    const isAdmin = userRole === "admin" || userRole === "super_admin";

    const dataSource = await getDataSource();
    const examRepository = dataSource.getRepository(Exam);

    if (isAdmin) {
      // Admins see all published exams regardless of program
      const exams = await examRepository.find({
        where: { status: ExamStatus.PUBLISHED, isActive: true },
        relations: ["institution", "program"],
        order: { createdAt: "DESC" },
      });
      return NextResponse.json({ success: true, data: exams });
    }

    // For regular users — enforce program-based access
    const userRepo = dataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: session.user.id } });

    const activeEnrollments = await getUserActiveEnrollments(session.user.id);

    // Fallback for legacy premium users
    const hasLegacyPremium =
      user?.isPremium &&
      (!user.premiumExpiresAt || new Date() <= new Date(user.premiumExpiresAt));

    if (activeEnrollments.length === 0 && !hasLegacyPremium) {
      return NextResponse.json(
        {
          success: false,
          error: "Active program enrollment required to access exams",
          requiresEnrollment: true,
        },
        { status: 403 },
      );
    }

    const enrolledProgramIds = activeEnrollments.map((e) => e.programId);

    const qb = examRepository
      .createQueryBuilder("exam")
      .leftJoinAndSelect("exam.institution", "institution")
      .leftJoinAndSelect("exam.program", "program")
      .where("exam.status = :status", { status: ExamStatus.PUBLISHED })
      .andWhere("exam.isActive = true");

    if (enrolledProgramIds.length > 0) {
      // Show exams belonging to the student's enrolled programs, or globally-marked exams.
      // Unclassified (programId IS NULL, isGlobal = false) exams are admin-only until classified.
      qb.andWhere(
        "(exam.programId IN (:...programIds) OR exam.isGlobal = true)",
        { programIds: enrolledProgramIds },
      );
    } else {
      // Legacy premium: show only globally-marked exams
      qb.andWhere("exam.isGlobal = true");
    }

    const exams = await qb.orderBy("exam.createdAt", "DESC").getMany();

    return NextResponse.json({ success: true, data: exams });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exams" },
      { status: 500 },
    );
  }
}
