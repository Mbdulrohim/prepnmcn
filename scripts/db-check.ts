/**
 * Quick DB health check — shows programs, user counts, enrollment counts.
 * Usage: npx tsx scripts/db-check.ts
 */
import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

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
import { Program } from "../src/entities/Program";
import { ProgramAdmin } from "../src/entities/ProgramAdmin";
import { UserProgramEnrollment } from "../src/entities/UserProgramEnrollment";

async function main() {
  const ds = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: false,
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

  await ds.initialize();
  console.log("✓ Connected\n");

  // Programs
  const programs = await ds
    .getRepository(Program)
    .find({ order: { createdAt: "ASC" } });
  console.log(`══ Programs (${programs.length}) ══`);
  if (programs.length === 0) {
    console.log("  (none — need to seed!)");
  } else {
    for (const p of programs) {
      console.log(
        `  ${p.code.padEnd(12)} ${p.name.padEnd(40)} active=${p.isActive}  id=${p.id}`,
      );
    }
  }

  // Users
  const totalUsers = await ds.getRepository(User).count();
  const premiumUsers = await ds
    .getRepository(User)
    .count({ where: { isPremium: true } });
  const superAdmins = await ds
    .getRepository(User)
    .createQueryBuilder("u")
    .where("u.role = :r", { r: "super_admin" })
    .getMany();
  console.log(`\n══ Users ══`);
  console.log(`  Total: ${totalUsers}`);
  console.log(`  Premium (isPremium=true): ${premiumUsers}`);
  console.log(`  Super admins: ${superAdmins.length}`);
  for (const sa of superAdmins) {
    console.log(`    ${sa.email} role=${sa.role} id=${sa.id}`);
  }

  // Enrollments
  const totalEnrollments = await ds
    .getRepository(UserProgramEnrollment)
    .count();
  console.log(`\n══ Program Enrollments ══`);
  console.log(`  Total: ${totalEnrollments}`);
  if (programs.length > 0) {
    for (const p of programs) {
      const active = await ds
        .getRepository(UserProgramEnrollment)
        .count({ where: { programId: p.id, status: "active" as any } });
      const pending = await ds
        .getRepository(UserProgramEnrollment)
        .count({
          where: { programId: p.id, status: "pending_approval" as any },
        });
      console.log(
        `  ${p.code.padEnd(12)} active=${active}  pending=${pending}`,
      );
    }
  }

  // Check tables exist
  const tables = await ds.query(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('programs','user_program_enrollments','program_admins') ORDER BY tablename`,
  );
  console.log(`\n══ Tables ══`);
  for (const t of tables) {
    console.log(`  ✓ ${t.tablename}`);
  }

  console.log("\n✓ Done");
  await ds.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
