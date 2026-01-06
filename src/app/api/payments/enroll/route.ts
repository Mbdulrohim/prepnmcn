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
import { calculateTotalPrice, toKobo } from "@/lib/programPricing";
import { getEnrollmentExpiryDate } from "@/lib/enrollmentHelpers";
import { initializePayment } from "@/lib/paystack";
import { ProgramCode } from "@/entities/Program";

// POST /api/payments/enroll - Initialize payment for program enrollment
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { programCodes, durationMonths = 12 } = body;

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

    // Calculate total price with discounts
    const pricing = calculateTotalPrice(programCodes as ProgramCode[]);

    // Create pending payment record
    const paymentRepo = dataSource.getRepository(Payment);
    const payment = paymentRepo.create({
      userId: session.user.id,
      amount: pricing.total,
      currency: "NGN",
      status: PaymentStatus.PENDING,
      method: PaymentMethod.CARD,
      paymentType: PaymentType.PROGRAM_ENROLLMENT,
      approvalStatus: ApprovalStatus.NOT_REQUIRED,
      programIds: programs.map((p) => p.id),
      description: `Enrollment in ${programs.map((p) => p.name).join(", ")}`,
    });

    await paymentRepo.save(payment);

    // Create pending enrollments
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);
    const expiresAt = getEnrollmentExpiryDate(durationMonths);

    for (const program of programs) {
      const enrollment = enrollmentRepo.create({
        userId: session.user.id,
        programId: program.id,
        paymentMethod: "online" as any,
        status: EnrollmentStatus.PENDING_APPROVAL,
        expiresAt,
        paymentId: payment.id,
        notes: "Pending online payment verification",
      });

      await enrollmentRepo.save(enrollment);
    }

    // Initialize Paystack payment
    const paystackResult = await initializePayment({
      email: session.user.email,
      amount: toKobo(pricing.total),
      reference: payment.id,
      callback_url: `${process.env.NEXTAUTH_URL}/payments/verify`,
      metadata: {
        paymentId: payment.id,
        userId: session.user.id,
        programCodes,
        durationMonths,
      },
      userId: session.user.id,
      description: payment.description,
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: pricing.total,
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        discountPercentage: pricing.discountPercentage,
      },
      paystack: {
        authorization_url: paystackResult.data.authorization_url,
        access_code: paystackResult.data.access_code,
        reference: paystackResult.data.reference,
      },
    });
  } catch (error) {
    console.error("Error initializing enrollment payment:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
