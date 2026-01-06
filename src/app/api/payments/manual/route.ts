import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import {
  Payment,
  PaymentStatus,
  PaymentMethod,
  PaymentType,
  ApprovalStatus,
} from "@/entities/Payment";
import {
  UserProgramEnrollment,
  EnrollmentStatus,
} from "@/entities/UserProgramEnrollment";
import { Program } from "@/entities/Program";
import { calculateTotalPrice } from "@/lib/programPricing";
import { getEnrollmentExpiryDate } from "@/lib/enrollmentHelpers";
import { ProgramCode } from "@/entities/Program";

// POST /api/payments/manual - Submit manual payment for admin approval
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      programCodes,
      paymentProof,
      transactionReference,
      durationMonths = 12,
    } = body;

    if (
      !programCodes ||
      !Array.isArray(programCodes) ||
      programCodes.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one program must be selected" },
        { status: 400 }
      );
    }

    if (!paymentProof && !transactionReference) {
      return NextResponse.json(
        { error: "Payment proof or transaction reference is required" },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const programRepo = dataSource.getRepository(Program);

    // Fetch selected programs
    const programs = await programRepo
      .createQueryBuilder("program")
      .where("program.code IN (:...codes)", { codes: programCodes })
      .andWhere("program.isActive = :isActive", { isActive: true })
      .getMany();

    if (programs.length !== programCodes.length) {
      return NextResponse.json(
        { error: "Some selected programs are not available" },
        { status: 400 }
      );
    }

    // Calculate total price
    const pricing = calculateTotalPrice(programCodes as ProgramCode[]);

    // Create payment record
    const paymentRepo = dataSource.getRepository(Payment);
    const payment = paymentRepo.create({
      userId: session.user.id,
      amount: pricing.total,
      currency: "NGN",
      status: PaymentStatus.PENDING,
      method: PaymentMethod.BANK_TRANSFER,
      paymentType: PaymentType.PROGRAM_ENROLLMENT,
      approvalStatus: ApprovalStatus.PENDING_APPROVAL,
      programIds: programs.map((p) => p.id),
      description: `Manual payment for enrollment in ${programs
        .map((p) => p.name)
        .join(", ")}`,
      paymentProof,
      transactionId: transactionReference,
    });

    await paymentRepo.save(payment);

    // Create pending enrollments
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);
    const expiresAt = getEnrollmentExpiryDate(durationMonths);

    for (const program of programs) {
      const enrollment = enrollmentRepo.create({
        userId: session.user.id,
        programId: program.id,
        paymentMethod: "manual" as any,
        status: EnrollmentStatus.PENDING_APPROVAL,
        expiresAt,
        paymentId: payment.id,
        notes: "Pending manual payment approval by admin",
      });

      await enrollmentRepo.save(enrollment);
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: pricing.total,
        status: "pending_approval",
      },
      message:
        "Manual payment submitted successfully. An admin will review and approve your enrollment.",
    });
  } catch (error) {
    console.error("Error submitting manual payment:", error);
    return NextResponse.json(
      { error: "Failed to submit manual payment" },
      { status: 500 }
    );
  }
}
