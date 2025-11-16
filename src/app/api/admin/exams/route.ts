import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { ExamCategory } from "@/entities/ExamCategory";
import { ExamPathway } from "@/entities/ExamPathway";
import { ExamPackage } from "@/entities/ExamPackage";
import { Exam } from "@/entities/Exam";

export async function GET() {
  try {
    const dataSource = await getDataSource();

    // Fetch all exams with their related data
    const exams = await dataSource.getRepository(Exam).find({
      relations: ["institution", "package", "examQuestions"],
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });

    // Transform the data to match the expected format
    const transformedExams = exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      subject: exam.subject,
      level: exam.package?.name || "General", // Use package name as level
      duration: exam.duration,
      totalQuestions: exam.examQuestions?.length || exam.questions?.length || 0,
      status: exam.status,
      type: exam.type,
      price: exam.price,
      currency: exam.currency,
      // expose scheduling & admin options in admin listing
      startAt: exam.startAt ? exam.startAt.toISOString() : null,
      endAt: exam.endAt ? exam.endAt.toISOString() : null,
      allowPreview: exam.allowPreview,
      maxAttempts: exam.maxAttempts,
      allowMultipleAttempts: exam.allowMultipleAttempts,
      createdAt: exam.createdAt.toISOString().split("T")[0], // Format as YYYY-MM-DD
    }));

    // Calculate stats
    const totalExams = transformedExams.length;
    const publishedExams = transformedExams.filter(
      (exam) => exam.status === "published"
    ).length;
    const draftExams = transformedExams.filter(
      (exam) => exam.status === "draft"
    ).length;
    const avgDuration =
      totalExams > 0
        ? Math.round(
            transformedExams.reduce(
              (sum, exam) => sum + (exam.duration || 0),
              0
            ) / totalExams
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        exams: transformedExams,
        stats: {
          total: totalExams,
          published: publishedExams,
          draft: draftExams,
          avgDuration: avgDuration,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const body = await request.json();
    const { type, examType, ...data } = body;

    let result;

    switch (type) {
      case "category":
        result = await dataSource.getRepository(ExamCategory).save(data);
        break;
      case "pathway":
        result = await dataSource.getRepository(ExamPathway).save(data);
        break;
      case "package":
        result = await dataSource.getRepository(ExamPackage).save(data);
        break;
      case "exam":
        // parse scheduling fields
        result = await dataSource.getRepository(Exam).save({
          ...data,
          type: examType,
          institutionId: data.institutionId || null,
          startAt: data.startAt ? new Date(data.startAt) : null,
          endAt: data.endAt ? new Date(data.endAt) : null,
          allowPreview: !!data.allowPreview,
          maxAttempts: data.maxAttempts !== undefined ? data.maxAttempts : 3,
          allowMultipleAttempts: !!data.allowMultipleAttempts,
        });
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Invalid type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error creating exam item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create exam item" },
      { status: 500 }
    );
  }
}
