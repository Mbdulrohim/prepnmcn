import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";
import { ExamAttempt } from "@/entities/ExamAttempt";

export const runtime = "nodejs";

export async function POST(
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
    const examRepo = dataSource.getRepository(Exam);
    const attemptRepo = dataSource.getRepository(ExamAttempt);

    // Find exam by share slug
    const exam = await examRepo.findOne({
      where: {
        shareSlug: slug,
        isShareable: true,
        status: "published" as any,
      },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found or not shareable" },
        { status: 404 }
      );
    }

    // Check for existing in-progress attempt
    const existingAttempt = await attemptRepo.findOne({
      where: {
        examId: exam.id,
        userId: session.user.id,
        isCompleted: false,
      },
    });

    if (existingAttempt) {
      return NextResponse.json({
        success: true,
        data: existingAttempt,
      });
    }

    // Create new attempt
    const attempt = attemptRepo.create({
      examId: exam.id,
      userId: session.user.id,
      answers: {},
      startedAt: new Date(),
      isCompleted: false,
      attemptNumber: 1,
    });

    await attemptRepo.save(attempt);

    return NextResponse.json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    console.error("Error starting exam:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start exam" },
      { status: 500 }
    );
  }
}
