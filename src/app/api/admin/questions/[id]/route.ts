import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Question } from "@/entities/Question";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const dataSource = await getDataSource();

    // Find the existing question
    const questionRepository = dataSource.getRepository(Question);
    const existingQuestion = await questionRepository.findOne({
      where: { id, isActive: true },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    // Update the question
    const updatedQuestion = await questionRepository.save({
      ...existingQuestion,
      question:
        data.question !== undefined ? data.question : existingQuestion.question,
      type: data.type !== undefined ? data.type : existingQuestion.type,
      options:
        data.options !== undefined ? data.options : existingQuestion.options,
      correctAnswer:
        data.correctAnswer !== undefined
          ? data.correctAnswer
          : existingQuestion.correctAnswer,
      explanation:
        data.explanation !== undefined
          ? data.explanation
          : existingQuestion.explanation,
      marks: data.marks !== undefined ? data.marks : existingQuestion.marks,
      order: data.order !== undefined ? data.order : existingQuestion.order,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();

    // Find the existing question
    const questionRepository = dataSource.getRepository(Question);
    const existingQuestion = await questionRepository.findOne({
      where: { id, isActive: true },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await questionRepository.save({
      ...existingQuestion,
      isActive: false,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
