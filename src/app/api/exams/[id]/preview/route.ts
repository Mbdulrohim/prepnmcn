import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";
import { Question } from "@/entities/Question";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const dataSource = await getDataSource();
    const examRepo = dataSource.getRepository(Exam);
    const exam = await examRepo.findOne({ where: { id } });
    if (!exam)
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    if (!exam.allowPreview)
      return NextResponse.json(
        { success: false, error: "Preview not allowed" },
        { status: 403 }
      );

    const questionRepo = dataSource.getRepository(Question);
    const questions = await questionRepo.find({
      where: { examId: id, isActive: true },
      order: { order: "ASC", createdAt: "ASC" },
      take: 3,
    });

    const sanitized = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      marks: q.marks,
    }));
    return NextResponse.json({ success: true, data: sanitized });
  } catch (error) {
    console.error("Error fetching preview:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch preview" },
      { status: 500 }
    );
  }
}
