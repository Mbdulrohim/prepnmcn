import { DataSource } from "typeorm";
import { User } from "./src/entities/User";
import { EmailCode } from "./src/entities/EmailCode";
import { Feedback } from "./src/entities/Feedback";
import { Institution } from "./src/entities/Institution";
import { Resource } from "./src/entities/Resource";
import { Payment } from "./src/entities/Payment";
import { AutomationRule } from "./src/entities/AutomationRule";
import { Notification } from "./src/entities/Notification";
import { Question } from "./src/entities/Question";
import { Exam } from "./src/entities/Exam";
import { ExamAttempt } from "./src/entities/ExamAttempt";
import { Challenge } from "./src/entities/Challenge";
import { AccessCode } from "./src/entities/AccessCode";
import { UserEnrollment } from "./src/entities/UserEnrollment";
import { ExamCategory } from "./src/entities/ExamCategory";
import { ExamPathway } from "./src/entities/ExamPathway";
import { ExamPackage } from "./src/entities/ExamPackage";
import { ExamEnrollment } from "./src/entities/ExamEnrollment";

export default new DataSource({
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
    Question,
    Exam,
    ExamAttempt,
    Challenge,
    AccessCode,
    UserEnrollment,
    ExamCategory,
    ExamPathway,
    ExamPackage,
    ExamEnrollment,
  ],
});
