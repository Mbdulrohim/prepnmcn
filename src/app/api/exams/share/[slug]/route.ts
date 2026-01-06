import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";
import { ExamAttempt } from "@/entities/ExamAttempt";
import { User } from "@/entities/User";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: session.user.id } });

    // Check if user has any active program enrollment
    const { getUserActiveEnrollments } = await import(
      "@/lib/enrollmentHelpers"
    );
    const activeEnrollments = await getUserActiveEnrollments(session.user.id);

    // Fallback to legacy premium check for backward compatibility
    const hasLegacyPremium =
      user?.isPremium &&
      (!user.premiumExpiresAt || new Date() <= new Date(user.premiumExpiresAt));

    if (activeEnrollments.length === 0 && !hasLegacyPremium) {
      return NextResponse.json(
        {
          success: false,
          error: "Active program enrollment required to access exams",
        },
        { status: 403 }
      );
    }

    const examRepo = dataSource.getRepository(Exam);
    const attemptRepo = dataSource.getRepository(ExamAttempt);

    // Find exam by shareSlug with program relationship
    const exam = await examRepo.findOne({
      where: { shareSlug: slug, isShareable: true },
      relations: ["program"],
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found or not shareable" },
        { status: 404 }
      );
    }

    // Check program access if exam is program-specific
    if (exam.programId && !exam.isGlobal) {
      const enrolledProgramIds = activeEnrollments.map((e: any) => e.programId);
      const hasAccess = enrolledProgramIds.includes(exam.programId);

      if (!hasAccess && !hasLegacyPremium) {
        return NextResponse.json(
          {
            success: false,
            error:
              "You don't have access to this exam. Please enroll in the required program.",
            requiredProgram: exam.program,
          },
          { status: 403 }
        );
      }
    }

    // Get existing attempts
    const attempts = await attemptRepo.find({
      where: {
        userId: session.user.id,
        examId: exam.id,
      },
      order: {
        createdAt: "DESC",
      },
    });

    const hasCompletedAttempt = attempts.some(
      (attempt) => attempt.completed === true
    );

    // Construct response
    const response = {
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        passingScore: exam.passingScore,
        totalQuestions: exam.totalQuestions,
        status: exam.status,
        type: exam.type,
        programId: exam.programId,
        isGlobal: exam.isGlobal,
        program: exam.program
          ? {
              id: exam.program.id,
              name: exam.program.name,
              code: exam.program.code,
            }
          : null,
      },
      attempts: attempts.map((attempt) => ({
        id: attempt.id,
        score: attempt.score,
        passed: attempt.passed,
        completed: attempt.completed,
        createdAt: attempt.createdAt,
        timeSpent: attempt.timeSpent,
      })),
      hasCompletedAttempt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching shareable exam:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}
