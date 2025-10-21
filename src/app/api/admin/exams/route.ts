import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { ExamCategory } from "@/entities/ExamCategory";
import { ExamPathway } from "@/entities/ExamPathway";
import { ExamPackage } from "@/entities/ExamPackage";
import { Exam } from "@/entities/Exam";

export async function GET() {
  try {
    const dataSource = await getDataSource();

    // Fetch exam categories with their pathways, packages, and exams
    const categories = await dataSource.getRepository(ExamCategory).find({
      where: { isActive: true },
      relations: [
        "pathways",
        "pathways.packages",
        "pathways.packages.exams",
        "pathways.packages.exams.examQuestions"
      ],
      order: { createdAt: "DESC" },
    });

    // Transform the data to match the expected format
    const transformedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      type: category.type,
      description: category.description,
      isActive: category.isActive,
      pathways: category.pathways?.map((pathway) => ({
        id: pathway.id,
        name: pathway.name,
        type: pathway.type,
        description: pathway.description,
        isActive: pathway.isActive,
        packages: pathway.packages?.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          packageType: pkg.packageType,
          frequency: pkg.frequency,
          price: pkg.price,
          currency: pkg.currency,
          isActive: pkg.isActive,
          exams: pkg.exams?.map((exam) => ({
            id: exam.id,
            title: exam.title,
            subject: exam.subject,
            type: exam.type,
            duration: exam.duration,
            totalMarks: exam.totalMarks,
            passingMarks: exam.passingMarks,
          })) || [],
        })) || [],
      })) || [],
    }));

    return NextResponse.json({
      success: true,
      data: transformedCategories,
    });
  } catch (error) {
    console.error("Error fetching exam structure:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exam structure" },
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
        result = await dataSource.getRepository(Exam).save({
          ...data,
          type: examType,
          institutionId: data.institutionId || null,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
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
