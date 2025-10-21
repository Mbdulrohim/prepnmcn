import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { ExamEnrollment } from "@/entities/ExamEnrollment";

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
    const enrollmentRepository = dataSource.getRepository(ExamEnrollment);

    // Fetch user's exam enrollments
    const enrollments = await enrollmentRepository.find({
      where: {
        userId: session.user.id,
      },
      relations: ["exam"],
      order: {
        createdAt: "DESC",
      },
    });

    return NextResponse.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}