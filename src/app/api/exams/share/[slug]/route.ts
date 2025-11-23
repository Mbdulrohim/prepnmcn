import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";
import { ExamAttempt } from "@/entities/ExamAttempt";
import { User } from "@/entities/User";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const dataSource = await getDataSource();
    
    // Check if user is premium
    const userRepo = dataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: session.user.id } });
    
    if (!user?.isPremium) {
      return NextResponse.json(
        { success: false, error: "Premium subscription required to access shareable exams" },
        { status: 403 }
      );
    }

    // Check if premium has expired
    if (user.premiumExpiresAt && new Date() > new Date(user.premiumExpiresAt)) {
      return NextResponse.json(
        { success: false, error: "Premium subscription has expired" },
        { status: 403 }
      );
    }

    const examRepo = dataSource.getRepository(Exam);
    const attemptRepo = dataSource.getRepository(ExamAttempt);

    // Debug: Check all exams with shareSlug
    const allShareableExams = await examRepo
      .createQueryBuilder("exam")
      .select([
        "exam.id",
        "exam.title",
        "exam.shareSlug",
        "exam.isShareable",
        "exam.status",
      ])
      .where("exam.shareSlug IS NOT NULL")
      .getMany();

    console.log("All shareable exams in DB:", allShareableExams);
    console.log("Looking for slug:", slug);

    // Find exam by share slug using query builder to select only existing columns
    const exam = await examRepo
      .createQueryBuilder("exam")
      .select([
        "exam.id",
        "exam.title",
        "exam.description",
        "exam.subject",
        "exam.duration",
        "exam.isShareable",
        "exam.shareSlug",
        "exam.status",
      ])
      .leftJoinAndSelect("exam.examQuestions", "questions")
      .where("exam.shareSlug = :slug", { slug })
      .getOne();

    console.log(
      "Found exam:",
      exam
        ? {
            id: exam.id,
            title: exam.title,
            status: exam.status,
            isShareable: exam.isShareable,
            questionsCount: exam.examQuestions?.length,
          }
        : null
    );

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found with this slug" },
        { status: 404 }
      );
    }

    if (!exam.isShareable) {
      return NextResponse.json(
        { success: false, error: "Exam is not shareable" },
        { status: 403 }
      );
    }

    // Check if exam is published
    if (exam.status !== "published") {
      return NextResponse.json(
        { success: false, error: `Exam is ${exam.status}, not published yet` },
        { status: 403 }
      );
    }

    // Check if user has an existing attempt
    const existingAttempt = await attemptRepo.findOne({
      where: {
        examId: exam.id,
        userId: session.user.id,
      },
      order: {
        createdAt: "DESC",
      },
    });

    // Count total questions
    const totalQuestions = exam.examQuestions?.length || 0;

    return NextResponse.json({
      success: true,
      data: {
        exam: {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          subject: exam.subject,
          duration: exam.duration,
          totalQuestions,
          isShareable: exam.isShareable,
          shareSlug: exam.shareSlug,
        },
        attempt: existingAttempt
          ? {
              id: existingAttempt.id,
              status: existingAttempt.isCompleted ? "completed" : "in_progress",
              isCompleted: existingAttempt.isCompleted,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching shareable exam:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}
