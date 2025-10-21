import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Question } from "@/entities/Question";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");

    if (!examId) {
      return NextResponse.json(
        { success: false, error: "Exam ID is required" },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const questions = await dataSource.getRepository(Question).find({
      where: { examId, isActive: true },
      order: { order: "ASC", createdAt: "ASC" },
    });

    // Transform the data to match the expected format
    const transformedQuestions = questions.map((question) => ({
      id: question.id,
      examId: question.examId,
      question: question.question,
      type: question.type,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      marks: question.marks,
      order: question.order,
      isActive: question.isActive,
      createdAt: question.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        questions: transformedQuestions,
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const dataSource = await getDataSource();

    // Get the highest order number for this exam
    const maxOrderResult = await dataSource
      .getRepository(Question)
      .createQueryBuilder("question")
      .select("MAX(question.order)", "max")
      .where("question.examId = :examId", { examId: data.examId })
      .getRawOne();

    const nextOrder = (maxOrderResult?.max || 0) + 1;

    const question = await dataSource.getRepository(Question).save({
      examId: data.examId,
      question: data.question,
      type: data.type,
      options: data.options,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      marks: data.marks || 1,
      order: nextOrder,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create question" },
      { status: 500 }
    );
  }
}
