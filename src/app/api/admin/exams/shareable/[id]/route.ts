import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";
import { Question } from "@/entities/Question";
import { ExamAttempt } from "@/entities/ExamAttempt";
import { ExamEnrollment } from "@/entities/ExamEnrollment";
import { ExamVersion } from "@/entities/ExamVersion";

export const runtime = "nodejs";

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
    const questionRepo = dataSource.getRepository(Question);
    const attemptRepo = dataSource.getRepository(ExamAttempt);
    const enrollmentRepo = dataSource.getRepository(ExamEnrollment);
    const versionRepo = dataSource.getRepository(ExamVersion);

    const exam = await examRepo.findOne({
      where: { id, isShareable: true },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Shareable exam not found" },
        { status: 404 }
      );
    }

    console.log("Deleting shareable exam:", id, exam.title);

    // Delete all related records in correct order (children first, then parent)

    // 1. Delete exam attempts
    const attempts = await attemptRepo.find({ where: { examId: id } });
    if (attempts.length > 0) {
      console.log(`Deleting ${attempts.length} exam attempts for exam ${id}`);
      await attemptRepo.remove(attempts);
    }

    // 2. Delete enrollments
    const enrollments = await enrollmentRepo.find({ where: { examId: id } });
    if (enrollments.length > 0) {
      console.log(`Deleting ${enrollments.length} enrollments for exam ${id}`);
      await enrollmentRepo.remove(enrollments);
    }

    // 3. Delete exam versions
    const versions = await versionRepo.find({ where: { examId: id } });
    if (versions.length > 0) {
      console.log(`Deleting ${versions.length} versions for exam ${id}`);
      await versionRepo.remove(versions);
    }

    // 4. Delete questions
    const questions = await questionRepo.find({ where: { examId: id } });
    if (questions.length > 0) {
      console.log(`Deleting ${questions.length} questions for exam ${id}`);
      await questionRepo.remove(questions);
    }

    // 5. Finally, delete the exam
    await examRepo.remove(exam);
    console.log("Shareable exam deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Shareable exam deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting shareable exam:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete shareable exam",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
