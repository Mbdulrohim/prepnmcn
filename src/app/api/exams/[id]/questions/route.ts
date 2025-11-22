import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Question } from "@/entities/Question";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if includeAnswers query parameter is present
    const { searchParams } = new URL(request.url);
    const includeAnswers = searchParams.get("includeAnswers") === "true";

    const dataSource = await getDataSource();
    const questionRepo = dataSource.getRepository(Question);

    const questions = await questionRepo.find({
      where: { examId: id, isActive: true },
      order: { order: "ASC", createdAt: "ASC" },
    });

    // Include correctAnswer if requested (for review pages), otherwise strip it
    const sanitized = questions.map((q) => ({
      id: q.id,
      examId: q.examId,
      question: q.question,
      type: q.type,
      options: q.options,
      ...(includeAnswers && { correctAnswer: q.correctAnswer }),
      explanation: q.explanation ? q.explanation : null,
      marks: q.marks,
      order: q.order,
      isActive: q.isActive,
      createdAt: q.createdAt,
    }));

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
