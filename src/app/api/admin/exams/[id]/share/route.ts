import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";

export const runtime = "nodejs";

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
    const { shareSlug } = body;

    if (!shareSlug) {
      return NextResponse.json(
        { success: false, error: "Share slug is required" },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const examRepo = dataSource.getRepository(Exam);

    // Check if slug already exists
    const existingExam = await examRepo.findOne({
      where: { shareSlug },
    });

    if (existingExam && existingExam.id !== id) {
      return NextResponse.json(
        { success: false, error: "This slug is already in use" },
        { status: 400 }
      );
    }

    // Update exam
    const exam = await examRepo.findOne({ where: { id } });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    exam.isShareable = true;
    exam.shareSlug = shareSlug;

    await examRepo.save(exam);

    return NextResponse.json({
      success: true,
      data: exam,
    });
  } catch (error) {
    console.error("Error enabling exam sharing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to enable sharing" },
      { status: 500 }
    );
  }
}

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

    const exam = await examRepo.findOne({ where: { id } });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    exam.isShareable = false;
    exam.shareSlug = undefined;

    await examRepo.save(exam);

    return NextResponse.json({
      success: true,
      data: exam,
    });
  } catch (error) {
    console.error("Error disabling exam sharing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to disable sharing" },
      { status: 500 }
    );
  }
}
