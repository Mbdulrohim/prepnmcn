import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";
import { User } from "@/entities/User";
import {
  ExamEnrollment,
  EnrollmentPaymentStatus,
} from "@/entities/ExamEnrollment";
import { getUserActiveEnrollments } from "@/lib/enrollmentHelpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const userRole = (session.user as any)?.role;
    const isAdmin = userRole === "admin" || userRole === "super_admin";

    const dataSource = await getDataSource();
    const examRepository = dataSource.getRepository(Exam);
    const exam = await examRepository.findOne({
      where: { id },
      relations: ["institution", "program"],
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 },
      );
    }

    // Only return published exams
    if (exam.status !== "published") {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 },
      );
    }

    if (!isAdmin) {
      const userRepo = dataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: session.user.id } });
      const activeEnrollments = await getUserActiveEnrollments(session.user.id);

      const hasLegacyPremium =
        user?.isPremium &&
        (!user.premiumExpiresAt ||
          new Date() <= new Date(user.premiumExpiresAt));

      if (activeEnrollments.length === 0 && !hasLegacyPremium) {
        return NextResponse.json(
          {
            success: false,
            error: "Active program enrollment required to access exams",
            requiresEnrollment: true,
          },
          { status: 403 },
        );
      }

      const enrolledProgramIds = activeEnrollments.map((e) => e.programId);

      const hasAccess =
        enrolledProgramIds.length > 0
          ? exam.isGlobal ||
            !exam.programId ||
            enrolledProgramIds.includes(exam.programId)
          : !exam.programId;

      if (!hasAccess) {
        return NextResponse.json(
          {
            success: false,
            error: "You do not have access to this exam",
            requiredProgram: exam.program ?? null,
          },
          { status: 403 },
        );
      }
    }

    // Determine enrollment status for schedule preview gating
    const enrollmentRepo = dataSource.getRepository(ExamEnrollment);
    const enrollment = await enrollmentRepo.findOne({
      where: { examId: id, userId: session.user.id },
    });

    const canSeeSchedule =
      !exam.price ||
      (enrollment &&
        enrollment.paymentStatus === EnrollmentPaymentStatus.COMPLETED);

    return NextResponse.json({
      success: true,
      data: {
        id: exam.id,
        title: exam.title,
        subject: exam.subject,
        description: exam.description,
        type: exam.type,
        duration: exam.duration,
        totalQuestions: exam.totalMarks,
        status: exam.status,
        price: exam.price,
        currency: exam.currency,
        passingScore: exam.passingMarks,
        createdAt: exam.createdAt,
        institutionId: exam.institutionId,
        institution: exam.institution
          ? { id: exam.institution.id, name: exam.institution.name }
          : null,
        programId: exam.programId ?? null,
        program: exam.program
          ? {
              id: exam.program.id,
              name: (exam.program as any).name,
              code: (exam.program as any).code,
            }
          : null,
        isGlobal: exam.isGlobal,
        startAt: canSeeSchedule ? exam.startAt : null,
        endAt: canSeeSchedule ? exam.endAt : null,
        allowPreview: exam.allowPreview,
        maxAttempts: exam.maxAttempts,
      },
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
