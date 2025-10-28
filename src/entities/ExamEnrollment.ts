import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Exam } from "./Exam";
import { ExamAttempt } from "./ExamAttempt";

export enum EnrollmentStatus {
  ENROLLED = "enrolled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum EnrollmentPaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

@Entity("exam_enrollments")
export class ExamEnrollment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid")
  examId!: string;

  @ManyToOne(() => Exam)
  @JoinColumn({ name: "examId" })
  exam!: Exam;

  @Column({
    type: "enum",
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ENROLLED,
  })
  status!: EnrollmentStatus;

  @Column({
    type: "enum",
    enum: EnrollmentPaymentStatus,
    default: EnrollmentPaymentStatus.PENDING,
  })
  paymentStatus!: EnrollmentPaymentStatus;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  amountPaid?: number;

  @Column({ type: "varchar", length: 10, default: "NGN" })
  currency!: string;

  @Column({ type: "timestamp", nullable: true })
  enrolledAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt?: Date;

  @Column({ type: "int", default: 0 })
  attemptsUsed!: number;

  @Column({ type: "int", default: 3 }) // Default max attempts
  maxAttempts!: number;

  @OneToMany("exam_attempts", "enrollment")
  attempts!: ExamAttempt[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
