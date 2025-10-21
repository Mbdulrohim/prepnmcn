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
import { ExamPackage } from "../entities/ExamPackage";
import { Exam } from "../entities/Exam";
import { Question } from "../entities/Question";
import { ExamAttempt } from "../entities/ExamAttempt";
import { Challenge } from "../entities/Challenge";
import { AccessCode } from "../entities/AccessCode";
import { UserEnrollment } from "../entities/UserEnrollment";
import { ExamEnrollment } from "../entities/ExamEnrollment";

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
      User,
      EmailCode,
      Feedback,
      Institution,
      Resource,
      Payment,
      AutomationRule,
      Notification,
      ExamCategory,
      ExamPathway,
      ExamPackage,
      Exam,
      Question,
      ExamAttempt,
      Challenge,
      AccessCode,
      UserEnrollment,
      ExamEnrollment,
    ],
    ssl: { rejectUnauthorized: false }, // Allow self-signed certificates
  });

  await AppDataSource.initialize();
  return AppDataSource;
}

export { AppDataSource };
