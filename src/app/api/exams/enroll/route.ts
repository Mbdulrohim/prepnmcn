import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import {
  ExamEnrollment,
  EnrollmentStatus,
  EnrollmentPaymentStatus,
} from "@/entities/ExamEnrollment";
import { Exam, ExamStatus } from "@/entities/Exam";
import { User } from "@/entities/User";
import { initializePayment, toKobo } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { examId } = await request.json();

    if (!examId) {
      return NextResponse.json(
        { success: false, error: "Exam ID is required" },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const enrollmentRepository = dataSource.getRepository(ExamEnrollment);
    const examRepository = dataSource.getRepository(Exam);

    // Check if exam exists and is published
    const exam = await examRepository.findOne({
      where: {
        id: examId,
        status: ExamStatus.PUBLISHED,
        isActive: true,
      },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found or not available" },
        { status: 404 }
      );
    }

    // Check if user is already enrolled
    const existingEnrollment = await enrollmentRepository.findOne({
      where: {
        userId: session.user.id,
        examId: examId,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: "Already enrolled in this exam" },
        { status: 400 }
      );
    }

    // For now, only allow free exams (price is null or 0)
    if (exam.price && exam.price > 0) {
      // Get user details for payment
      const userRepository = dataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: session.user.id },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      // Initialize payment with Paystack
      try {
        const paymentResult = await initializePayment({
          email: user.email,
          amount: toKobo(exam.price), // Convert to kobo
          userId: session.user.id,
          description: `Exam enrollment: ${exam.title}`,
          metadata: {
            examId: examId,
            examTitle: exam.title,
            type: "exam_enrollment",
          },
          callback_url: `${process.env.NEXTAUTH_URL}/exams?payment=success`,
        });

        // Create enrollment with pending payment status
        const enrollment = enrollmentRepository.create({
          userId: session.user.id,
          examId: examId,
          status: EnrollmentStatus.ENROLLED,
          paymentStatus: EnrollmentPaymentStatus.PENDING,
          amountPaid: exam.price,
          currency: exam.currency || "NGN",
          enrolledAt: new Date(),
          maxAttempts: exam.maxAttempts || 3,
        });

        await enrollmentRepository.save(enrollment);

        return NextResponse.json({
          success: true,
          data: {
            enrollment,
            payment: {
              url: paymentResult.data.authorization_url,
              reference: paymentResult.data.reference,
            },
          },
          message: "Payment initialized. Please complete payment to enroll.",
        });
      } catch (paymentError) {
        console.error("Payment initialization error:", paymentError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to initialize payment. Please try again.",
          },
          { status: 500 }
        );
      }
    }

    // Create enrollment for free exam
    const enrollment = enrollmentRepository.create({
      userId: session.user.id,
      examId: examId,
      status: EnrollmentStatus.ENROLLED,
      paymentStatus: EnrollmentPaymentStatus.COMPLETED, // Free exam
      amountPaid: 0,
      currency: exam.currency || "NGN",
      enrolledAt: new Date(),
      maxAttempts: exam.maxAttempts || 3,
    });

    await enrollmentRepository.save(enrollment);

    return NextResponse.json({
      success: true,
      data: enrollment,
      message: "Successfully enrolled in exam",
    });
  } catch (error) {
    console.error("Error enrolling in exam:", error);
    return NextResponse.json(
      { success: false, error: "Failed to enroll in exam" },
      { status: 500 }
    );
  }
}
