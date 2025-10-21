import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";

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
    const updatedExam = await examRepository.save({
      ...existingExam,
      title: data.title !== undefined ? data.title : existingExam.title,
      description:
        data.description !== undefined
          ? data.description
          : existingExam.description,
      subject: data.subject !== undefined ? data.subject : existingExam.subject,
      type: data.examType !== undefined ? data.examType : existingExam.type,
      duration:
        data.duration !== undefined ? data.duration : existingExam.duration,
      totalMarks:
        data.totalMarks !== undefined
          ? data.totalMarks
          : existingExam.totalMarks,
      passingMarks:
        data.passingMarks !== undefined
          ? data.passingMarks
          : existingExam.passingMarks,
      price: data.price !== undefined ? data.price : existingExam.price,
      currency:
        data.currency !== undefined ? data.currency : existingExam.currency,
      institutionId:
        data.institutionId !== undefined
          ? data.institutionId
          : existingExam.institutionId,
      status: data.status !== undefined ? data.status : existingExam.status,
      updatedAt: new Date(),
    });

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
