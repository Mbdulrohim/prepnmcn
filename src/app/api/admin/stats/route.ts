import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";
import { Resource } from "@/entities/Resource";
import { Institution } from "@/entities/Institution";
import { Feedback } from "@/entities/Feedback";
import { EmailCode } from "@/entities/EmailCode";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET() {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const AppDataSource = await getDataSource();

    const userRepo = AppDataSource.getRepository(User);
    const resourceRepo = AppDataSource.getRepository(Resource);
    const institutionRepo = AppDataSource.getRepository(Institution);
    const feedbackRepo = AppDataSource.getRepository(Feedback);
    const emailCodeRepo = AppDataSource.getRepository(EmailCode);

    const [
      userCount,
      resourceCount,
      institutionCount,
      feedbackCount,
      emailCodeCount,
    ] = await Promise.all([
      userRepo.count(),
      resourceRepo.count(),
      institutionRepo.count(),
      feedbackRepo.count(),
      emailCodeRepo.count(),
    ]);

    return NextResponse.json({
      userCount,
      resourceCount,
      institutionCount,
      feedbackCount,
      emailCodeCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: "Error fetching stats" },
      { status: 500 }
    );
  }
}
