import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { ExamAttempt } from "@/entities/ExamAttempt";
import { ExamEnrollment, EnrollmentStatus } from "@/entities/ExamEnrollment";
import { Question, QuestionType } from "@/entities/Question";

export const runtime = "nodejs";

async function calculateScore(
  attemptAnswers: Record<string, any>,
  questions: Question[]
) {
  let score = 0;
  let totalMarks = 0;

  for (const q of questions) {
    const marks = q.marks || 1;
    totalMarks += marks;

    // For essay questions, skip automatic scoring
    if (q.type === QuestionType.ESSAY) {
      continue;
    }

    const submitted = attemptAnswers[q.id];
    if (submitted === undefined || submitted === null) continue;

    // Normalize values for comparison
    const normalizedSubmitted = String(submitted).trim().toLowerCase();
    const normalizedCorrect = String(q.correctAnswer || "")
      .trim()
      .toLowerCase();

    // If correctAnswer matches option text or index, award marks
    if (normalizedCorrect && normalizedSubmitted) {
      if (normalizedCorrect === normalizedSubmitted) {
        score += marks;
      } else {
        // If correct answer appears to be an option text, check that mapping
        if (Array.isArray(q.options)) {
          // Check if submitted is numeric index
          const maybeIndex = parseInt(submitted as any, 10);
          if (!isNaN(maybeIndex) && q.options[maybeIndex]) {
            if (
              q.options[maybeIndex].trim().toLowerCase() === normalizedCorrect
            ) {
              score += marks;
            }
          } else {
            // Compare option text directly
            const match = q.options.find(
              (opt) => opt.trim().toLowerCase() === normalizedSubmitted
            );
            if (match && match.trim().toLowerCase() === normalizedCorrect) {
              score += marks;
            }
          }
        }
      }
    }
  }

  return { score, totalMarks };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(ExamAttempt);
    const attempt = await repo.findOne({ where: { id } });

    if (!attempt)
      return NextResponse.json(
        { success: false, error: "Attempt not found" },
        { status: 404 }
      );
    if ((attempt.userId as any) !== session.user.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );

    return NextResponse.json({ success: true, data: attempt });
  } catch (error) {
    console.error("Error getting attempt:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load attempt" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );

    const { answers, timeTaken } = await request.json();
    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(ExamAttempt);

    const attempt = await repo.findOne({ where: { id } });
    if (!attempt)
      return NextResponse.json(
        { success: false, error: "Attempt not found" },
        { status: 404 }
      );
    if ((attempt.userId as any) !== session.user.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    if (attempt.isCompleted)
      return NextResponse.json(
        { success: false, error: "Attempt already completed" },
        { status: 400 }
      );

    // Merge answers
    const merged = { ...(attempt.answers || {}), ...(answers || {}) };
    attempt.answers = merged;
    if (typeof timeTaken === "number") attempt.timeTaken = timeTaken;

    await repo.save(attempt);
    return NextResponse.json({ success: true, data: attempt });
  } catch (error) {
    console.error("Error saving attempt:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save attempt" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // This endpoint is used to submit and grade an attempt
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(ExamAttempt);
    const questionRepo = dataSource.getRepository(Question);
    const enrollmentRepo = dataSource.getRepository(ExamEnrollment);

    const attempt = await repo.findOne({
      where: { id },
      relations: ["enrollment"],
    });
    if (!attempt)
      return NextResponse.json(
        { success: false, error: "Attempt not found" },
        { status: 404 }
      );
    if ((attempt.userId as any) !== session.user.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    if (attempt.isCompleted)
      return NextResponse.json(
        { success: false, error: "Attempt already completed" },
        { status: 400 }
      );

    const examQuestions = await questionRepo.find({
      where: { examId: attempt.examId, isActive: true },
    });

    const { score, totalMarks } = await calculateScore(
      attempt.answers || {},
      examQuestions as Question[]
    );

    attempt.score = score;
    attempt.totalMarks = totalMarks;
    attempt.completedAt = new Date();
    attempt.isCompleted = true;

    await repo.save(attempt);

    // Update enrollment status
    if (attempt.enrollmentId) {
      const enrollment = await enrollmentRepo.findOne({
        where: { id: attempt.enrollmentId },
      });
      if (enrollment) {
        enrollment.status = EnrollmentStatus.COMPLETED;
        enrollment.completedAt = new Date();
        await enrollmentRepo.save(enrollment);
      }
    }

    return NextResponse.json({ success: true, data: { score, totalMarks } });
  } catch (error) {
    console.error("Error submitting attempt:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit attempt" },
      { status: 500 }
    );
  }
}
