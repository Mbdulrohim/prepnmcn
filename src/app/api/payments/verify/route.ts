import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Payment, PaymentStatus } from "@/entities/Payment";
import { ExamEnrollment, EnrollmentPaymentStatus } from "@/entities/ExamEnrollment";
import { verifyPayment } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Payment reference is required" },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();

    // Verify payment with Paystack
    const verificationResult = await verifyPayment(reference);

    if (!verificationResult.success) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const paymentData = verificationResult.data;

    // Update payment status in database
    const paymentRepository = dataSource.getRepository(Payment);
    const payment = await paymentRepository.findOne({
      where: { transactionId: reference },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment record not found" },
        { status: 404 }
      );
    }

    // Update payment status
    payment.status = paymentData.status === "success" ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
    await paymentRepository.save(payment);

    // If payment was successful and it's for exam enrollment, update enrollment
    if (payment.status === PaymentStatus.COMPLETED && paymentData.metadata?.type === "exam_enrollment") {
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
      { status: 500 }
    );
  }
}