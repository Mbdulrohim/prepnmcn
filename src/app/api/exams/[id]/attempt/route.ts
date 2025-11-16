import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";
import {
  ExamEnrollment,
  EnrollmentPaymentStatus,
  EnrollmentStatus,
} from "@/entities/ExamEnrollment";
import { ExamAttempt } from "@/entities/ExamAttempt";

export const runtime = "nodejs";

export async function POST(
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
    const examRepo = dataSource.getRepository(Exam);
    const enrollmentRepo = dataSource.getRepository(ExamEnrollment);
    const attemptRepo = dataSource.getRepository(ExamAttempt);

    const exam = await examRepo.findOne({ where: { id } });
    if (!exam || exam.status !== "published" || !exam.isActive) {
      return NextResponse.json(
        { success: false, error: "Exam not found or unavailable" },
        { status: 404 }
      );
    }

    // Ensure enrolled
    const enrollment = await enrollmentRepo.findOne({
      where: { userId: session.user.id, examId: id },
    });
    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "You are not enrolled in this exam" },
        { status: 403 }
      );
    }

    // Check scheduled time window
    const now = new Date();
    if (exam.startAt && now < new Date(exam.startAt)) {
      return NextResponse.json(
        {
          success: false,
          error: `Exam is scheduled to start at ${exam.startAt}`,
        },
        { status: 403 }
      );
    }

    if (exam.endAt && now > new Date(exam.endAt)) {
      return NextResponse.json(
        { success: false, error: "Exam window has closed" },
        { status: 403 }
      );
    }

    // Check max attempts
    if (enrollment.attemptsUsed >= (enrollment.maxAttempts || 0)) {
      return NextResponse.json(
        { success: false, error: "Max attempts exceeded" },
        { status: 403 }
      );
    }

    // Create attempt
    const attempt = attemptRepo.create({
      userId: session.user.id,
      examId: id,
      enrollmentId: enrollment.id,
      answers: {},
      startedAt: new Date(),
      isCompleted: false,
      attemptNumber: (enrollment.attemptsUsed || 0) + 1,
    });

    await attemptRepo.save(attempt);

    // Update enrollment
    enrollment.attemptsUsed = (enrollment.attemptsUsed || 0) + 1;
    enrollment.status = EnrollmentStatus.IN_PROGRESS;
    await enrollmentRepo.save(enrollment);

    return NextResponse.json({ success: true, data: attempt });
  } catch (error) {
    console.error("Error creating attempt:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create attempt" },
      { status: 500 }
    );
  }
}
