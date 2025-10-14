import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import { User } from "@/entities/User";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "super_admin"].includes((session.user as any)?.role)) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const AppDataSource = await getDataSource();
    const paymentRepo = AppDataSource.getRepository(Payment);

    const [payments, total] = await paymentRepo.findAndCount({
      relations: ["user"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });

    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      userId: payment.userId,
      userName: payment.user.name,
      userEmail: payment.user.email,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      description: payment.description,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    }));

    return NextResponse.json({
      payments: formattedPayments,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { message: "Error fetching payments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "super_admin"].includes((session.user as any)?.role)) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const {
      userId,
      amount,
      currency,
      status,
      method,
      description,
      transactionId,
    } = await req.json();

    if (!userId || !amount) {
      return NextResponse.json(
        { message: "User ID and amount are required" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const paymentRepo = AppDataSource.getRepository(Payment);
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const payment = paymentRepo.create({
      userId,
      amount: parseFloat(amount),
      currency: currency || "NGN",
      status: status || "pending",
      method: method || "card",
      description,
      transactionId,
    });

    await paymentRepo.save(payment);

    return NextResponse.json({
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { message: "Error creating payment" },
      { status: 500 }
    );
  }
}
