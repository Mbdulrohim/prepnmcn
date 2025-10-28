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
import { Exam } from "./Exam";
import { ExamEnrollment } from "./ExamEnrollment";

@Entity("exam_attempts")
export class ExamAttempt {
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

  @Column("uuid", { nullable: true })
  enrollmentId?: string;

  @ManyToOne(() => ExamEnrollment)
  @JoinColumn({ name: "enrollmentId" })
  enrollment?: ExamEnrollment;

  @Column("json", { nullable: true })
  answers?: Record<string, any>; // User's answers keyed by question ID

  @Column("int", { nullable: true })
  score?: number;

  @Column("int", { nullable: true })
  totalMarks?: number;

  @Column("int", { nullable: true })
  timeTaken?: number; // Time taken in seconds

  @Column({ type: "timestamp", nullable: true })
  startedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt?: Date;

  @Column({ type: "boolean", default: false })
  isCompleted!: boolean;

  @Column("int", { default: 1 })
  attemptNumber!: number; // Which attempt this is for the user

  @Column({ type: "boolean", default: false })
  isReviewed!: boolean; // For essay questions that need manual grading

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
