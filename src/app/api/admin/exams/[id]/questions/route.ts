import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";
import { Question } from "@/entities/Question";

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
    const questionRepo = dataSource.getRepository(Question);

    const questions = await questionRepo.find({
      where: { exam: { id } },
      order: { createdAt: "ASC" },
    });

    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const { questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Questions array is required" },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const examRepo = dataSource.getRepository(Exam);
    const questionRepo = dataSource.getRepository(Question);

    const exam = await examRepo.findOne({ where: { id } });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    // Delete existing questions
    await questionRepo.delete({ exam: { id } });

    // Create new questions
    const savedQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const question = questionRepo.create({
        examId: id,
        question: q.questionText,
        type: "multiple_choice" as any,
        options: [q.optionA, q.optionB, q.optionC, q.optionD],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
        marks: q.marks || 1,
        order: i,
        isActive: true,
      });

      const saved = await questionRepo.save(question);
      savedQuestions.push(saved);
    }

    // Update exam total marks
    const totalMarks = savedQuestions.reduce((sum, q) => sum + q.marks, 0);
    exam.totalMarks = totalMarks;
    await examRepo.save(exam);

    return NextResponse.json({
      success: true,
      data: savedQuestions,
    });
  } catch (error) {
    console.error("Error saving questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save questions" },
      { status: 500 }
    );
  }
}
