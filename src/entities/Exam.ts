import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { ExamCategory } from "./ExamCategory";
import { ExamAttempt } from "./ExamAttempt";
import { ExamEnrollment } from "./ExamEnrollment";
import { Question } from "./Question";

export enum ExamStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum ExamType {
  MOCK = "mock",
  PRACTICE = "practice",
  OFFICIAL = "official",
}

@Entity("exams")
export class Exam {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ type: "int" })
  duration!: number; // in minutes

  @Column({ type: "int" })
  totalQuestions!: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  passingScore!: number; // percentage

  @Column({
    type: "enum",
    enum: ExamStatus,
    default: ExamStatus.DRAFT,
  })
  status!: ExamStatus;

  @Column({
    type: "enum",
    enum: ExamType,
    default: ExamType.PRACTICE,
  })
  type!: ExamType;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price!: number;

  @Column({ type: "varchar", length: 3, default: "NGN" })
  currency!: string;

  @Column({ type: "timestamp", nullable: true })
  scheduledAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  startTime!: Date;

  @Column({ type: "timestamp", nullable: true })
  endTime!: Date;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => ExamCategory, (category) => category.exams)
  @JoinColumn({ name: "categoryId" })
  category!: ExamCategory;

  @Column({ type: "uuid" })
  categoryId!: string;

  @OneToMany(() => ExamAttempt, (attempt) => attempt.exam)
  attempts!: ExamAttempt[];

  @OneToMany(() => ExamEnrollment, (enrollment) => enrollment.exam)
  enrollments!: ExamEnrollment[];

  @OneToMany(() => Question, (question) => question.exam)
  questions!: Question[];
}
