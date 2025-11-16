import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const examRepository = dataSource.getRepository(Exam);

    const exam = await examRepository.findOne({
      where: { id },
      relations: ["examQuestions"],
    });

    if (!exam) {
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
        status: exam.status,
        duration: exam.duration,
        totalQuestions: exam.examQuestions?.length || 0,
        description: exam.description,
      },
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const dataSource = await getDataSource();

    // Find the existing exam
    const examRepository = dataSource.getRepository(Exam);
    const existingExam = await examRepository.findOne({
      where: { id, isActive: true },
    });

    if (!existingExam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    // Update the exam
    existingExam.title =
      data.title !== undefined ? data.title : existingExam.title;
    existingExam.description =
      data.description !== undefined
        ? data.description
        : existingExam.description;
    existingExam.subject =
      data.subject !== undefined ? data.subject : existingExam.subject;
    existingExam.type =
      data.examType !== undefined ? data.examType : existingExam.type;
    existingExam.duration =
      data.duration !== undefined ? data.duration : existingExam.duration;
    existingExam.totalMarks =
      data.totalMarks !== undefined ? data.totalMarks : existingExam.totalMarks;
    existingExam.passingMarks =
      data.passingMarks !== undefined
        ? data.passingMarks
        : existingExam.passingMarks;
    existingExam.price =
      data.price !== undefined ? data.price : existingExam.price;
    existingExam.currency =
      data.currency !== undefined ? data.currency : existingExam.currency;
    existingExam.institutionId =
      data.institutionId !== undefined
        ? data.institutionId
        : existingExam.institutionId;
    existingExam.status =
      data.status !== undefined ? data.status : existingExam.status;
    existingExam.startAt =
      data.startAt !== undefined
        ? data.startAt
          ? new Date(data.startAt)
          : null
        : existingExam.startAt;
    existingExam.endAt =
      data.endAt !== undefined
        ? data.endAt
          ? new Date(data.endAt)
          : null
        : existingExam.endAt;
    existingExam.allowPreview =
      data.allowPreview !== undefined
        ? Boolean(data.allowPreview)
        : existingExam.allowPreview;
    existingExam.maxAttempts =
      data.maxAttempts !== undefined
        ? Number(data.maxAttempts)
        : existingExam.maxAttempts;
    existingExam.allowMultipleAttempts =
      data.allowMultipleAttempts !== undefined
        ? Boolean(data.allowMultipleAttempts)
        : existingExam.allowMultipleAttempts;
    existingExam.updatedAt = new Date();

    const updatedExam = await examRepository.save(existingExam);

    return NextResponse.json({
      success: true,
      data: updatedExam,
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update exam" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const dataSource = await getDataSource();

    const examRepository = dataSource.getRepository(Exam);
    const existingExam = await examRepository.findOne({
      where: { id, isActive: true },
    });
    if (!existingExam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    existingExam.title = data.title ?? existingExam.title;
    existingExam.description = data.description ?? existingExam.description;
    existingExam.subject = data.subject ?? existingExam.subject;
    existingExam.type = data.examType ?? data.type ?? existingExam.type;
    existingExam.duration = data.duration ?? existingExam.duration;
    existingExam.totalMarks = data.totalMarks ?? existingExam.totalMarks;
    existingExam.passingMarks = data.passingMarks ?? existingExam.passingMarks;
    existingExam.price = data.price ?? existingExam.price;
    existingExam.currency = data.currency ?? existingExam.currency;
    existingExam.institutionId =
      data.institutionId ?? existingExam.institutionId;
    existingExam.status = data.status ?? existingExam.status;
    existingExam.shareSlug = data.shareSlug ?? existingExam.shareSlug;
    existingExam.startAt =
      data.startAt !== undefined
        ? data.startAt
          ? new Date(data.startAt)
          : null
        : existingExam.startAt;
    existingExam.endAt =
      data.endAt !== undefined
        ? data.endAt
          ? new Date(data.endAt)
          : null
        : existingExam.endAt;
    existingExam.allowPreview =
      data.allowPreview !== undefined
        ? Boolean(data.allowPreview)
        : existingExam.allowPreview;
    existingExam.maxAttempts =
      data.maxAttempts !== undefined
        ? Number(data.maxAttempts)
        : existingExam.maxAttempts;
    existingExam.allowMultipleAttempts =
      data.allowMultipleAttempts !== undefined
        ? Boolean(data.allowMultipleAttempts)
        : existingExam.allowMultipleAttempts;
    existingExam.updatedAt = new Date();

    const saved = await examRepository.save(existingExam);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Error patching exam:", error);
    return NextResponse.json(
      { success: false, error: "Failed to patch exam" },
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
    const dataSource = await getDataSource();

    // Find the existing exam
    const examRepository = dataSource.getRepository(Exam);
    const existingExam = await examRepository.findOne({
      where: { id, isActive: true },
    });

    if (!existingExam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await examRepository.save({
      ...existingExam,
      isActive: false,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete exam" },
      { status: 500 }
    );
  }
}
