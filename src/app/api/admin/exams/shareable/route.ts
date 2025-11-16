import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam, ExamStatus, ExamType } from "@/entities/Exam";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dataSource = await getDataSource();
    const examRepo = dataSource.getRepository(Exam);

    // Use query builder to select only existing columns
    const shareableExams = await examRepo
      .createQueryBuilder("exam")
      .select([
        "exam.id",
        "exam.title",
        "exam.subject",
        "exam.shareSlug",
        "exam.isShareable",
        "exam.status",
        "exam.duration",
        "exam.createdAt",
      ])
      .leftJoinAndSelect("exam.examQuestions", "questions")
      .where("exam.isShareable = :isShareable", { isShareable: true })
      .orderBy("exam.createdAt", "DESC")
      .getMany();

    const transformedExams = shareableExams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      subject: exam.subject,
      shareSlug: exam.shareSlug,
      isShareable: exam.isShareable,
      status: exam.status,
      duration: exam.duration,
      totalQuestions: exam.examQuestions?.length || 0,
      createdAt: exam.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: transformedExams,
    });
  } catch (error) {
    console.error("Error fetching shareable exams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shareable exams" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, subject, type, duration, shareSlug } = body;

    if (!title || !subject || !shareSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, subject, and share slug are required",
        },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const examRepo = dataSource.getRepository(Exam);

    // Check if slug already exists
    const existingExam = await examRepo.findOne({
      where: { shareSlug },
    });

    if (existingExam) {
      return NextResponse.json(
        { success: false, error: "This share slug is already in use" },
        { status: 400 }
      );
    }

    const isExamType = (value: unknown): value is ExamType =>
      Object.values(ExamType).includes(value as ExamType);

    const normalizedType = isExamType(type) ? type : ExamType.QUIZ;

    // Create the shareable exam
    const exam = examRepo.create();
    exam.title = title;
    exam.description = description || "";
    exam.subject = subject;
    exam.type = normalizedType;
    exam.duration = duration || 60;
    exam.totalMarks = 100;
    exam.passingMarks = 40;
    exam.price = 0;
    exam.currency = "USD";
    exam.status = ExamStatus.DRAFT; // Start as draft until questions are added
    exam.isShareable = true;
    exam.shareSlug = shareSlug;
    exam.isActive = true;
    exam.allowPreview = false;
    exam.maxAttempts = 0;
    exam.allowMultipleAttempts = true;

    await examRepo.save(exam);

    return NextResponse.json({
      success: true,
      data: exam,
    });
  } catch (error) {
    console.error("Error creating shareable exam:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create shareable exam" },
      { status: 500 }
    );
  }
}
