import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { ExamPackage } from "./ExamPackage";

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

@Entity("user_enrollments")
export class UserEnrollment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid")
  packageId!: string;

  @ManyToOne(() => ExamPackage)
  @JoinColumn({ name: "packageId" })
  package!: ExamPackage;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus!: PaymentStatus;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  amountPaid?: number;

  @Column({ type: "varchar", length: 10, default: "NGN" })
  currency!: string;

  @Column({ type: "timestamp", nullable: true })
  enrolledAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  expiresAt?: Date; // For subscription-based packages

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  progressPercentage!: number; // 0-100

  @Column("int", { default: 0 })
  studyStreak!: number; // Current streak in days

  @Column({ type: "timestamp", nullable: true })
  lastActivity?: Date;

  @Column({ type: "boolean", default: true })
  notificationsEnabled!: boolean;

  @Column("json", { nullable: true })
  completedExams?: string[]; // IDs of completed exams in this package

  @Column("json", { nullable: true })
  progressData?: {
    examsAttempted: number;
    examsCompleted: number;
    totalStudyTime: number; // in minutes
    averageScore: number;
    lastExamDate?: Date;
  };

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
