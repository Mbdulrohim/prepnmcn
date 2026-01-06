import { getDataSource } from "../lib/database";
import { Program, ProgramCode } from "../entities/Program";
import {
  UserProgramEnrollment,
  EnrollmentStatus,
} from "../entities/UserProgramEnrollment";
import { User } from "../entities/User";

/**
 * Seed initial programs and migrate existing premium users to RM program
 */
async function seedProgramsAndMigrateUsers() {
  try {
    console.log("Starting database seeding...");
    const dataSource = await getDataSource();

    // 1. Create programs if they don't exist
    const programRepo = dataSource.getRepository(Program);

    const programsData = [
      {
        code: ProgramCode.RM,
        name: "Registered Midwife (RM)",
        description:
          "Comprehensive resources and assessments for Registered Midwife program",
        price: 15000,
        durationMonths: 12,
        metadata: {
          displayOrder: 1,
          icon: "hospital",
          color: "#4F46E5",
        },
      },
      {
        code: ProgramCode.RN,
        name: "Registered Nurse (RN)",
        description:
          "Complete learning materials and exams for Registered Nurse program",
        price: 15000,
        durationMonths: 12,
        metadata: {
          displayOrder: 2,
          icon: "stethoscope",
          color: "#10B981",
        },
      },
      {
        code: ProgramCode.RPHN,
        name: "Registered Public Health Nurse (RPHN)",
        description:
          "Specialized content for Registered Public Health Nurse certification",
        price: 15000,
        durationMonths: 12,
        metadata: {
          displayOrder: 3,
          icon: "heart-pulse",
          color: "#F59E0B",
        },
      },
      {
        code: ProgramCode.SPECIALTY,
        name: "Speciality Program",
        description:
          "Advanced program for medical students with premium features",
        price: 20000,
        durationMonths: 12,
        metadata: {
          displayOrder: 4,
          icon: "graduation-cap",
          color: "#8B5CF6",
        },
      },
    ];

    const programs: Program[] = [];

    for (const programData of programsData) {
      let program = await programRepo.findOne({
        where: { code: programData.code },
      });

      if (!program) {
        program = programRepo.create({
          ...programData,
          isActive: true,
        });
        await programRepo.save(program);
        console.log(`✓ Created program: ${program.name}`);
      } else {
        console.log(`  Program already exists: ${program.name}`);
      }

      programs.push(program);
    }

    // 2. Migrate existing premium users to RM program
    console.log("\nMigrating existing premium users to RM program...");

    const userRepo = dataSource.getRepository(User);
    const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

    const rmProgram = programs.find((p) => p.code === ProgramCode.RM);
    if (!rmProgram) {
      console.error("RM program not found!");
      return;
    }

    const premiumUsers = await userRepo.find({
      where: { isPremium: true },
    });

    console.log(`Found ${premiumUsers.length} premium users to migrate`);

    for (const user of premiumUsers) {
      // Check if enrollment already exists
      const existing = await enrollmentRepo.findOne({
        where: {
          userId: user.id,
          programId: rmProgram.id,
        },
      });

      if (existing) {
        console.log(`  User ${user.email} already has RM enrollment`);
        continue;
      }

      // Create enrollment
      const enrollment = enrollmentRepo.create({
        userId: user.id,
        programId: rmProgram.id,
        paymentMethod: "manual" as any,
        status: EnrollmentStatus.ACTIVE,
        expiresAt: user.premiumExpiresAt,
        enrollmentDate: user.createdAt || new Date(),
        notes: "Migrated from legacy premium access system",
      });

      await enrollmentRepo.save(enrollment);
      console.log(`✓ Migrated user: ${user.email} to RM program`);
    }

    console.log("\n✅ Database seeding completed successfully!");
    console.log(`Total programs: ${programs.length}`);
    console.log(`Total users migrated: ${premiumUsers.length}`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    process.exit();
  }
}

// Run the seed function
seedProgramsAndMigrateUsers();
