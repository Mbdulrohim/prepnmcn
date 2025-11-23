import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";
import { Question } from "@/entities/Question";

export const runtime = "nodejs";

export async function DELETE(
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
    const questionRepo = dataSource.getRepository(Question);

    const exam = await examRepo.findOne({
      where: { id, isShareable: true },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Shareable exam not found" },
        { status: 404 }
      );
    }

    console.log("Deleting shareable exam:", id, exam.title);

    // Delete all related questions first
    const questions = await questionRepo.find({ where: { examId: id } });
    if (questions.length > 0) {
      console.log(`Deleting ${questions.length} questions for exam ${id}`);
      await questionRepo.remove(questions);
    }

    // Delete the exam
    await examRepo.remove(exam);
    console.log("Shareable exam deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Shareable exam deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting shareable exam:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete shareable exam",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
