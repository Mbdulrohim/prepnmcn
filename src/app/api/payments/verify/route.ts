import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Payment, PaymentStatus, PaymentType } from "@/entities/Payment";
import {
  ExamEnrollment,
  EnrollmentPaymentStatus,
} from "@/entities/ExamEnrollment";
import {
  UserProgramEnrollment,
  EnrollmentStatus,
} from "@/entities/UserProgramEnrollment";
import { verifyPayment } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Payment reference is required" },
        { status: 400 },
      );
    }

    const dataSource = await getDataSource();

    // Verify payment with Paystack
    const verificationResult = await verifyPayment(reference);

    if (!verificationResult.success) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 },
      );
    }

    const paymentData = verificationResult.data;

    // Update payment status in database
    const paymentRepository = dataSource.getRepository(Payment);
    let payment = await paymentRepository.findOne({
      where: { transactionId: reference },
    });

    // Also try finding by ID (reference can be payment ID)
    if (!payment) {
      payment = await paymentRepository.findOne({
        where: { id: reference },
      });
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment record not found" },
        { status: 404 },
      );
    }

    // Update payment status
    payment.status =
      paymentData.status === "success"
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;
    await paymentRepository.save(payment);

    // If payment was successful, activate related enrollments
    if (payment.status === PaymentStatus.COMPLETED) {
      // Handle program enrollment payments — auto-activate
      if (payment.paymentType === PaymentType.PROGRAM_ENROLLMENT) {
        const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);
        const pendingEnrollments = await enrollmentRepo.find({
          where: {
            paymentId: payment.id,
            status: EnrollmentStatus.PENDING_APPROVAL,
          },
        });

        for (const enrollment of pendingEnrollments) {
          enrollment.status = EnrollmentStatus.ACTIVE;
          enrollment.approvedAt = new Date();
          enrollment.notes = "Auto-activated via online payment verification";

          if (!enrollment.expiresAt) {
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 12);
            enrollment.expiresAt = expiresAt;
          }

          await enrollmentRepo.save(enrollment);
        }
      }

      // Handle exam enrollment payments
      if (paymentData.metadata?.type === "exam_enrollment") {
        const enrollmentRepository = dataSource.getRepository(ExamEnrollment);
        const enrollment = await enrollmentRepository.findOne({
          where: {
            userId: session.user.id,
            examId: paymentData.metadata.examId,
            paymentStatus: EnrollmentPaymentStatus.PENDING,
          },
        });

        if (enrollment) {
          enrollment.paymentStatus = EnrollmentPaymentStatus.COMPLETED;
          await enrollmentRepository.save(enrollment);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        payment: paymentData,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
