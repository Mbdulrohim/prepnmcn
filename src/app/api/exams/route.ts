import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam, ExamStatus } from "@/entities/Exam";
import { Institution } from "@/entities/Institution";

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
    const examRepository = dataSource.getRepository(Exam);

    // Fetch published exams with institution details
    const exams = await examRepository.find({
      where: {
        status: ExamStatus.PUBLISHED,
        isActive: true,
      },
      relations: ["institution"],
      order: {
        createdAt: "DESC",
      },
    });

    return NextResponse.json({
      success: true,
      data: exams,
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}
