/**
 * Seed default programs & migrate all existing users.
 *
 * What it does (safe to run multiple times):
 *  1. Seeds 4 default programs (RM, RN, RPHN, SPECIALTY) — skips existing ones
 *  2. Assigns ALL existing users to the RN program:
 *     - Premium users → Active enrollment (expiry preserved)
 *     - Non-premium users → Pending enrollment
 *  3. Prints a summary
 *
 * Usage:
 *   npx tsx scripts/seed-and-migrate.ts
 *   npx tsx scripts/seed-and-migrate.ts --dry-run          # preview only
 *   npx tsx scripts/seed-and-migrate.ts --program RM       # target different program
 */

import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

// Load env vars
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env

// ── Entity imports ──────────────────────────────────────────────────────────
import { User } from "../src/entities/User";
import { EmailCode } from "../src/entities/EmailCode";
import { Feedback } from "../src/entities/Feedback";
import { Institution } from "../src/entities/Institution";
import { Resource } from "../src/entities/Resource";
import { Payment } from "../src/entities/Payment";
import { AutomationRule } from "../src/entities/AutomationRule";
import { Notification } from "../src/entities/Notification";
import { ExamCategory } from "../src/entities/ExamCategory";
import { ExamPathway } from "../src/entities/ExamPathway";
import { UserEnrollment } from "../src/entities/UserEnrollment";
import { ExamPackage } from "../src/entities/ExamPackage";
import { ExamEnrollment } from "../src/entities/ExamEnrollment";
import { ExamAttempt } from "../src/entities/ExamAttempt";
import { Question } from "../src/entities/Question";
import { Exam } from "../src/entities/Exam";
import { ExamVersion } from "../src/entities/ExamVersion";
import { Challenge } from "../src/entities/Challenge";
import { AccessCode } from "../src/entities/AccessCode";
import { ChatMessage } from "../src/entities/ChatMessage";
import { CommunityVoice } from "../src/entities/CommunityVoice";
import { CampusStory } from "../src/entities/CampusStory";
import { LearnerTestimonial } from "../src/entities/LearnerTestimonial";
import { BlogPost } from "../src/entities/BlogPost";
import { Email } from "../src/entities/Email";
import { Program, ProgramCode } from "../src/entities/Program";
import { ProgramAdmin } from "../src/entities/ProgramAdmin";
import {
  UserProgramEnrollment,
  EnrollmentStatus,
  PaymentMethod,
} from "../src/entities/UserProgramEnrollment";

// ── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const programArgIdx = args.indexOf("--program");
const TARGET_CODE =
  programArgIdx !== -1 && args[programArgIdx + 1]
    ? args[programArgIdx + 1].toUpperCase()
    : "RN";

// ── Default programs to seed ────────────────────────────────────────────────
const DEFAULT_PROGRAMS = [
  {
    code: ProgramCode.RM,
    name: "Registered Midwife (RM)",
    description:
      "Professional certification program for Registered Midwives. Access exam preparation materials, practice tests, and resources.",
    price: 15000,
    durationMonths: 12,
    metadata: {
      features: [
        "Practice Exams",
        "Downloadable Resources",
        "Shareable Assessments",
        "Progress Tracking",
      ],
      icon: "Baby",
      color: "#E91E63",
      displayOrder: 1,
    },
  },
  {
    code: ProgramCode.RN,
    name: "Registered Nurse (RN)",
    description:
      "Professional certification program for Registered Nurses. Access exam preparation materials, practice tests, and resources.",
    price: 15000,
    durationMonths: 12,
    metadata: {
      features: [
        "Practice Exams",
        "Downloadable Resources",
        "Shareable Assessments",
        "Progress Tracking",
      ],
      icon: "Stethoscope",
      color: "#2196F3",
      displayOrder: 2,
    },
  },
  {
    code: ProgramCode.RPHN,
    name: "Registered Public Health Nurse (RPHN)",
    description:
      "Professional certification program for Registered Public Health Nurses. Access exam preparation materials, practice tests, and resources.",
    price: 15000,
    durationMonths: 12,
    metadata: {
      features: [
        "Practice Exams",
        "Downloadable Resources",
        "Shareable Assessments",
        "Progress Tracking",
      ],
      icon: "HeartPulse",
      color: "#4CAF50",
      displayOrder: 3,
    },
  },
  {
    code: ProgramCode.SPECIALTY,
    name: "Specialty Program",
    description:
      "Specialty Program for medical students. Includes premium resources, shareable exams, and comprehensive exam preparation for specialty certifications.",
    price: 20000,
    durationMonths: 12,
    metadata: {
      features: [
        "Practice Exams",
        "Downloadable Resources",
        "Shareable Assessments",
        "Progress Tracking",
        "Specialty Certifications",
      ],
      icon: "GraduationCap",
      color: "#9C27B0",
      displayOrder: 4,
    },
  },
];

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  O'Prep — Seed Programs & Migrate Users");
  console.log("═══════════════════════════════════════════════════════");
  if (DRY_RUN) console.log("  ⚠  DRY RUN — no changes will be written\n");
  else console.log("");

  // Connect
  const dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true, // auto-create new tables/columns
    logging: false,
    entities: [
      Institution,
      ExamCategory,
      CommunityVoice,
      CampusStory,
      LearnerTestimonial,
      BlogPost,
      ExamPackage,
      Exam,
      Question,
      ExamVersion,
      ExamAttempt,
      ExamEnrollment,
      User,
      EmailCode,
      Feedback,
      Resource,
      Payment,
      AutomationRule,
      Notification,
      ExamPathway,
      UserEnrollment,
      Challenge,
      AccessCode,
      ChatMessage,
      Email,
      Program,
      ProgramAdmin,
      UserProgramEnrollment,
    ],
    ssl: true,
    extra: { ssl: { rejectUnauthorized: false } },
  });

  await dataSource.initialize();
  console.log("✓ Database connected\n");

  // ── Step 1: Seed programs ───────────────────────────────────────────────
  console.log("── Step 1: Seed Default Programs ──");
  const programRepo = dataSource.getRepository(Program);
  let createdCount = 0;

  for (const programData of DEFAULT_PROGRAMS) {
    const existing = await programRepo.findOne({
      where: { code: programData.code },
    });

    if (existing) {
      console.log(`  ○ ${programData.name} — already exists`);
    } else if (DRY_RUN) {
      console.log(`  ◉ ${programData.name} — would create`);
      createdCount++;
    } else {
      const program = programRepo.create({ ...programData, isActive: true });
      await programRepo.save(program);
      console.log(`  ✓ ${programData.name} — created`);
      createdCount++;
    }
  }

  console.log(
    `  → ${createdCount} program(s) ${DRY_RUN ? "would be" : ""} created\n`,
  );

  // ── Step 2: Migrate users ──────────────────────────────────────────────
  console.log(`── Step 2: Migrate Users → ${TARGET_CODE} ──`);

  const targetProgram = await programRepo.findOne({
    where: { code: TARGET_CODE },
  });

  if (!targetProgram && !DRY_RUN) {
    console.error(
      `  ✗ Target program "${TARGET_CODE}" not found. Seed programs first.`,
    );
    await dataSource.destroy();
    process.exit(1);
  }

  const userRepo = dataSource.getRepository(User);
  const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

  const allUsers = await userRepo.find();
  console.log(`  Total users in database: ${allUsers.length}`);

  // Batch-fetch all existing enrollments for the target program to avoid N+1 queries
  const existingEnrollmentUserIds = new Set<string>();
  if (targetProgram) {
    const existingEnrollments = await enrollmentRepo.find({
      where: { programId: targetProgram.id },
      select: ["userId"],
    });
    for (const e of existingEnrollments) {
      existingEnrollmentUserIds.add(e.userId);
    }
    console.log(
      `  Already enrolled in ${TARGET_CODE}: ${existingEnrollmentUserIds.size}`,
    );
  }

  let migrated = 0;
  let skipped = 0;
  let premiumActivated = 0;
  let pendingCreated = 0;
  const enrollmentsToInsert: any[] = [];

  for (const user of allUsers) {
    if (existingEnrollmentUserIds.has(user.id)) {
      skipped++;
      continue;
    }

    const isPremiumUser =
      user.isPremium &&
      (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date());

    const status = isPremiumUser
      ? EnrollmentStatus.ACTIVE
      : EnrollmentStatus.PENDING_APPROVAL;

    const expiresAt = isPremiumUser
      ? user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date()
        ? user.premiumExpiresAt
        : (() => {
            const d = new Date();
            d.setMonth(d.getMonth() + 12);
            return d;
          })()
      : null;

    if (!DRY_RUN && targetProgram) {
      enrollmentsToInsert.push({
        userId: user.id,
        programId: targetProgram.id,
        paymentMethod: PaymentMethod.MANUAL,
        status,
        expiresAt,
        approvedAt: isPremiumUser ? new Date() : undefined,
        notes: isPremiumUser
          ? `Migrated from legacy premium on ${new Date().toISOString()}`
          : `Bulk-assigned to ${TARGET_CODE} on ${new Date().toISOString()}`,
      });
    }

    migrated++;
    if (isPremiumUser) premiumActivated++;
    else pendingCreated++;
  }

  // Batch-insert all enrollments at once
  if (enrollmentsToInsert.length > 0) {
    // Insert in batches of 50 to avoid huge single queries
    const BATCH_SIZE = 50;
    for (let i = 0; i < enrollmentsToInsert.length; i += BATCH_SIZE) {
      const batch = enrollmentsToInsert.slice(i, i + BATCH_SIZE);
      await enrollmentRepo.insert(batch);
    }
  }

  console.log(`  Skipped (already enrolled): ${skipped}`);
  console.log(`  Premium → Active enrollment: ${premiumActivated}`);
  console.log(`  Non-premium → Pending enrollment: ${pendingCreated}`);
  console.log(
    `  Total ${DRY_RUN ? "would migrate" : "migrated"}: ${migrated}\n`,
  );

  // ── Summary ────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════════");
  if (DRY_RUN) {
    console.log("  DRY RUN complete — no changes were made.");
    console.log("  Run without --dry-run to apply changes.");
  } else {
    console.log("  ✅ All done!");
  }
  console.log("═══════════════════════════════════════════════════════\n");

  await dataSource.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
