import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getDataSource } from "@/lib/database";
import { Payment, PaymentStatus, PaymentType } from "@/entities/Payment";
import {
  UserProgramEnrollment,
  EnrollmentStatus,
} from "@/entities/UserProgramEnrollment";
import {
  ExamEnrollment,
  EnrollmentPaymentStatus,
} from "@/entities/ExamEnrollment";
import { In } from "typeorm";

export const runtime = "nodejs";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

function verifySignature(payload: string, signature: string): boolean {
  if (!PAYSTACK_SECRET_KEY) return false;
  const hash = createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-paystack-signature");
    const rawBody = await req.text();

    if (!signature || !verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { event, data } = body;

    console.log(`[Paystack Webhook] Event: ${event}`);

    if (event === "charge.success") {
      await handleChargeSuccess(data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Paystack Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handleChargeSuccess(data: any) {
  const dataSource = await getDataSource();
  const paymentRepo = dataSource.getRepository(Payment);
  const reference = data.reference;

  if (!reference) {
    console.error("[Paystack Webhook] No reference in charge data");
    return;
  }

  // Find payment by reference (could be ID or transactionId)
  let payment = await paymentRepo.findOne({ where: { id: reference } });
  if (!payment) {
    payment = await paymentRepo.findOne({
      where: { transactionId: reference },
    });
  }

  if (!payment) {
    console.error(
      `[Paystack Webhook] Payment not found for reference: ${reference}`,
    );
    return;
  }

  // Already processed
  if (payment.status === PaymentStatus.COMPLETED) {
    console.log(`[Paystack Webhook] Payment ${reference} already completed`);
    return;
  }

  // Update payment status
  payment.status = PaymentStatus.COMPLETED;
  payment.transactionId = data.reference;
  await paymentRepo.save(payment);

  console.log(`[Paystack Webhook] Payment ${reference} marked as completed`);

  // Handle program enrollment payments — auto-activate enrollments
  if (payment.paymentType === PaymentType.PROGRAM_ENROLLMENT) {
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

    // Find pending enrollments linked to this payment
    const pendingEnrollments = await enrollmentRepo.find({
      where: {
        paymentId: payment.id,
        status: EnrollmentStatus.PENDING_APPROVAL,
      },
    });

    for (const enrollment of pendingEnrollments) {
      enrollment.status = EnrollmentStatus.ACTIVE;
      enrollment.approvedAt = new Date();
      enrollment.notes = "Auto-activated via online payment (Paystack)";

      // Set expiry if not already set
      if (!enrollment.expiresAt) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 12); // Default 12 months
        enrollment.expiresAt = expiresAt;
      }

      await enrollmentRepo.save(enrollment);
      console.log(
        `[Paystack Webhook] Enrollment ${enrollment.id} activated for user ${enrollment.userId}`,
      );
    }
  }

  // Handle exam enrollment payments
  if (data.metadata?.type === "exam_enrollment" && data.metadata?.examId) {
    const enrollmentRepo = dataSource.getRepository(ExamEnrollment);
    const enrollment = await enrollmentRepo.findOne({
      where: {
        userId: payment.userId,
        examId: data.metadata.examId,
        paymentStatus: EnrollmentPaymentStatus.PENDING,
      },
    });

    if (enrollment) {
      enrollment.paymentStatus = EnrollmentPaymentStatus.COMPLETED;
      await enrollmentRepo.save(enrollment);
      console.log(
        `[Paystack Webhook] Exam enrollment ${enrollment.id} payment completed`,
      );
    }
  }
}
