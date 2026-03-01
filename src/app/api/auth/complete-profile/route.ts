import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";
import { Institution } from "@/entities/Institution";
import { Program } from "@/entities/Program";
import {
  UserProgramEnrollment,
  EnrollmentStatus,
  PaymentMethod,
} from "@/entities/UserProgramEnrollment";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { email, name, institution, programCodes } = await request.json();

    if (!email || !name || !institution) {
      return NextResponse.json(
        { error: "Email, name, and institution are required" },
        { status: 400 },
      );
    }

    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);
    const institutionRepo = AppDataSource.getRepository(Institution);

    const existingUser = await userRepo.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const institutionEntity = await institutionRepo.findOne({
      where: { name: institution },
    });

    if (!institutionEntity) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 400 },
      );
    }

    const user = userRepo.create({
      email: email.toLowerCase(),
      name: name.trim(),
      institution: institutionEntity,
      role: "user",
      points: 0,
    });

    await userRepo.save(user);

    // Create pending program enrollments for selected programs
    // These are NOT active yet — admin or payment must activate them
    if (
      programCodes &&
      Array.isArray(programCodes) &&
      programCodes.length > 0
    ) {
      const programRepo = AppDataSource.getRepository(Program);
      const enrollmentRepo = AppDataSource.getRepository(UserProgramEnrollment);

      for (const code of programCodes) {
        const program = await programRepo.findOne({
          where: { code, isActive: true },
        });

        if (program) {
          const enrollment = enrollmentRepo.create({
            userId: user.id,
            programId: program.id,
            paymentMethod: PaymentMethod.MANUAL,
            status: EnrollmentStatus.PENDING_APPROVAL,
            notes:
              "Auto-created during registration — awaiting payment or admin approval",
          });

          await enrollmentRepo.save(enrollment);
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        institution: user.institution?.name || null,
        role: user.role,
        points: user.points,
      },
    });
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
