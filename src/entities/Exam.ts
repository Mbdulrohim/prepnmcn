import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Institution } from "./Institution";
import { ExamPackage } from "./ExamPackage";
import { Question } from "./Question";

export enum ExamStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  DISABLED = "disabled",
  ARCHIVED = "archived",
}

export enum ExamType {
  QUIZ = "quiz",
  MIDTERM = "midterm",
  FINAL = "final",
  PRACTICE = "practice",
  CERTIFICATION = "certification",
  LICENSING = "licensing",
  PROFESSIONAL = "professional",
}

@Entity("exams")
export class Exam {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  title?: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  subject?: string;

  @Column({
    type: "enum",
    enum: ExamType,
    default: ExamType.QUIZ,
  })
  type!: ExamType;

  @Column({ type: "int", nullable: true })
  duration?: number; // Duration in minutes

  @Column({ type: "int", nullable: true })
  totalMarks?: number;

  @Column({ type: "int", default: 0 })
  passingMarks!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ type: "varchar", length: 10, default: "NGN" })
  currency!: string;

  @Column({ type: "json", nullable: true })
  questions!: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    marks: number;
    explanation?: string;
  }>;

  @Column("uuid", { nullable: true })
  institutionId?: string;

  @ManyToOne(() => Institution, { nullable: true })
  @JoinColumn({ name: "institutionId" })
  institution?: Institution;

  @Column("uuid", { nullable: true })
  packageId!: string;

  @ManyToOne("exam_packages", "exams")
  @JoinColumn({ name: "packageId" })
  package!: ExamPackage;

  @Column({
    type: "enum",
    enum: ExamStatus,
    default: ExamStatus.DRAFT,
  })
  status!: ExamStatus;

  @Column({ type: "timestamp", nullable: true })
  // start date/time for scheduled/controlled exams
  startAt?: Date | null;

  @Column({ type: "timestamp", nullable: true })
  endAt?: Date | null;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "boolean", default: false })
  allowPreview!: boolean;

  @Column({ type: "int", default: 3 })
  maxAttempts?: number;

  @Column({ type: "boolean", default: false })
  allowMultipleAttempts!: boolean;

  @Column({ type: "boolean", default: false })
  isShareable!: boolean; // True for link-shareable exams

  @Column({ type: "varchar", length: 100, unique: true, nullable: true })
  shareSlug?: string; // Unique slug for shareable link (e.g., "math-quiz-2024")

  @OneToMany("questions", "exam")
  examQuestions!: Question[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
