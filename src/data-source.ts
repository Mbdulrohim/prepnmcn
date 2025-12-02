import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "./entities/User";
import { EmailCode } from "./entities/EmailCode";
import { Feedback } from "./entities/Feedback";
import { Institution } from "./entities/Institution";
import { Resource } from "./entities/Resource";
import { Payment } from "./entities/Payment";
import { AutomationRule } from "./entities/AutomationRule";
import { Notification } from "./entities/Notification";
import { ExamCategory } from "./entities/ExamCategory";
import { ExamPathway } from "./entities/ExamPathway";
import { UserEnrollment } from "./entities/UserEnrollment";
import { ExamPackage } from "./entities/ExamPackage";
import { ExamEnrollment } from "./entities/ExamEnrollment";
import { ExamAttempt } from "./entities/ExamAttempt";
import { Question } from "./entities/Question";
import { Exam } from "./entities/Exam";
import { ExamVersion } from "./entities/ExamVersion";
import { Challenge } from "./entities/Challenge";
import { AccessCode } from "./entities/AccessCode";
import { ChatMessage } from "./entities/ChatMessage";
import { CommunityVoice } from "./entities/CommunityVoice";
import { CampusStory } from "./entities/CampusStory";
import { LearnerTestimonial } from "./entities/LearnerTestimonial";
import { BlogPost } from "./entities/BlogPost";
import { Email } from "./entities/Email";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
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
  ],
  migrations: ["src/migrations/*.ts"],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
