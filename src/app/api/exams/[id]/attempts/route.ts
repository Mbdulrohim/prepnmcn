import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { ExamAttempt } from "@/entities/ExamAttempt";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dataSource = await getDataSource();
    const attemptRepo = dataSource.getRepository(ExamAttempt);

    // Get all attempts for this user and exam
    const attempts = await attemptRepo.find({
      where: {
        examId: id,
        userId: session.user.id,
      },
      order: {
        createdAt: "DESC",
      },
    });

    // Calculate percentage and status for each attempt
    const attemptsWithMetadata = attempts.map((attempt) => {
      const totalQuestions = Object.keys(attempt.answers || {}).length;
      const percentage =
        totalQuestions > 0
          ? Math.round(((attempt.score || 0) / totalQuestions) * 100)
          : 0;

      const status = attempt.isCompleted
        ? "completed"
        : attempt.startedAt
        ? "in_progress"
        : "abandoned";

      return {
        ...attempt,
        percentage,
        status,
      };
    });

    return NextResponse.json({
      success: true,
      data: attemptsWithMetadata,
    });
  } catch (error) {
    console.error("Error fetching exam attempts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exam attempts" },
      { status: 500 }
    );
  }
}
