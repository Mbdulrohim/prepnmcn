import { NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { getDataSource } from "../../../../lib/database";
import { User } from "../../../../entities/User";
import { UserProgramEnrollment } from "../../../../entities/UserProgramEnrollment";

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
    const users = await userRepo.find({
      relations: ["institution"],
    });

    // Fetch all program enrollments with program info
    const enrollmentRepo = AppDataSource.getRepository(UserProgramEnrollment);
    const allEnrollments = await enrollmentRepo.find({
      relations: ["program"],
    });

    // Group enrollments by userId
    const enrollmentsByUser = new Map<string, any[]>();
    for (const enrollment of allEnrollments) {
      const userId = enrollment.userId;
      if (!enrollmentsByUser.has(userId)) {
        enrollmentsByUser.set(userId, []);
      }
      enrollmentsByUser.get(userId)!.push({
        programId: enrollment.programId,
        programCode: (enrollment.program as any)?.code || "N/A",
        programName: (enrollment.program as any)?.name || "N/A",
        status: enrollment.status,
        expiresAt: enrollment.expiresAt,
        paymentMethod: enrollment.paymentMethod,
      });
    }

    const formattedUsers = users.map((user) => ({
      ...user,
      institution: user.institution ? user.institution.name : "N/A",
      programEnrollments: enrollmentsByUser.get(user.id) || [],
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 },
    );
  }
}
