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
import { Challenge } from "../entities/Challenge";
import { AccessCode } from "../entities/AccessCode";

let AppDataSource: DataSource;

export async function getDataSource(): Promise<DataSource> {
  if (AppDataSource && AppDataSource.isInitialized) {
    return AppDataSource;
  }

  // Import reflect-metadata dynamically to avoid bundling issues
  await import("reflect-metadata");

  AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: process.env.NODE_ENV === "development",
    entities: [
      Institution,
      ExamCategory,
      ExamPackage,
      Exam,
      Question,
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
    ],
    ssl: { rejectUnauthorized: false }, // Allow self-signed certificates
  });

  await AppDataSource.initialize();
  return AppDataSource;
}

export { AppDataSource };
