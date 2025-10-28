import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";

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
    const examRepository = dataSource.getRepository(Exam);
    const exam = await examRepository.findOne({
      where: { id },
      relations: ["institution"],
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    // Only return published exams
    if (exam.status !== "published") {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: exam.id,
        title: exam.title,
        subject: exam.subject,
        description: exam.description,
        type: exam.type,
        duration: exam.duration,
        totalQuestions: exam.totalMarks,
        status: exam.status,
        price: exam.price,
        currency: exam.currency,
        passingScore: exam.passingMarks,
        createdAt: exam.createdAt,
        institutionId: exam.institutionId,
        institution: exam.institution
          ? {
              id: exam.institution.id,
              name: exam.institution.name,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
