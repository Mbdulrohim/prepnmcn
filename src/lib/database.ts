import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { EmailCode } from "../entities/EmailCode";
import { Feedback } from "../entities/Feedback";
import { Institution } from "../entities/Institution";
import { Resource } from "../entities/Resource";
import { Payment } from "../entities/Payment";
import { AutomationRule } from "../entities/AutomationRule";
import { Notification } from "../entities/Notification";
import { ExamCategory } from "../entities/ExamCategory";
import { ExamPathway } from "../entities/ExamPathway";
import { UserEnrollment } from "../entities/UserEnrollment";
import { ExamPackage } from "../entities/ExamPackage";
import { ExamEnrollment } from "../entities/ExamEnrollment";
import { ExamAttempt } from "../entities/ExamAttempt";
import { Question } from "../entities/Question";
import { Exam } from "../entities/Exam";
import { ExamVersion } from "../entities/ExamVersion";
import { Challenge } from "../entities/Challenge";
import { AccessCode } from "../entities/AccessCode";
import { ChatMessage } from "../entities/ChatMessage";
import { CommunityVoice } from "../entities/CommunityVoice";
import { CampusStory } from "../entities/CampusStory";
import { LearnerTestimonial } from "../entities/LearnerTestimonial";
import { BlogPost } from "../entities/BlogPost";
import { Email } from "../entities/Email";
import { Program } from "../entities/Program";
import { ProgramAdmin } from "../entities/ProgramAdmin";
import { UserProgramEnrollment } from "../entities/UserProgramEnrollment";
import { Forum } from "../entities/Forum";
import { ForumPost } from "../entities/ForumPost";
import { ForumMember } from "../entities/ForumMember";

let AppDataSource: DataSource;

export async function getDataSource(): Promise<DataSource> {
  if (AppDataSource && AppDataSource.isInitialized) {
    return AppDataSource;
  }

  AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: process.env.NODE_ENV === "development",
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
      Forum,
      ForumPost,
      ForumMember,
    ],
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  });

  await AppDataSource.initialize();

  // Auto-seed default programs (RM, RN, RPHN, SPECIALTY) on first init
  try {
    // Verify entity metadata is available before seeding
    if (AppDataSource.hasMetadata(Program)) {
      const { seedDefaultPrograms } = await import("./seedPrograms");
      await seedDefaultPrograms(AppDataSource);
    }
  } catch (error) {
    console.error("[database] Failed to seed default programs:", error);
  }

  return AppDataSource;
}

export { AppDataSource };
