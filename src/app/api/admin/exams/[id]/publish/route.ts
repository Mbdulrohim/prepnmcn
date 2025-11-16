import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";
import { ExamVersion } from "@/entities/ExamVersion";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const examRepository = dataSource.getRepository(Exam);

    const exam = await examRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      // If no body provided, use defaults
      body = {};
    }

    const note = body.note || null;
    const publishedBy = body.publishedBy || null;

    // Snapshot the exam (questions + metadata)
    const versionRepo = dataSource.getRepository(ExamVersion);
    const snapshot = {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      questions: exam.questions,
      passingMarks: exam.passingMarks,
      maxAttempts: exam.maxAttempts,
      allowPreview: exam.allowPreview,
      startAt: exam.startAt ? exam.startAt.toISOString() : null,
      endAt: exam.endAt ? exam.endAt.toISOString() : null,
    };

    const newVersion = await versionRepo.save({
      examId: exam.id,
      snapshot,
      note,
      publishedBy,
    });

    // Mark exam as published
    exam.status = "published" as any;
    await examRepository.save(exam);

    return NextResponse.json({ success: true, data: newVersion });
  } catch (error) {
    console.error("Error publishing exam:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish exam" },
      { status: 500 }
    );
  }
}
