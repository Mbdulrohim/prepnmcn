import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { ExamPackage } from "./ExamPackage";
import { User } from "./User";
import { Exam } from "./Exam";

export enum ChallengeType {
  DAILY_QUIZ = "daily_quiz",
  WEEKLY_ASSESSMENT = "weekly_assessment",
  FULL_CHALLENGE = "full_challenge",
}

@Entity("challenges")
export class Challenge {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  packageId!: string;

  @ManyToOne(() => ExamPackage)
  @JoinColumn({ name: "packageId" })
  package!: ExamPackage;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: ChallengeType,
    default: ChallengeType.FULL_CHALLENGE,
  })
  type!: ChallengeType;

  @Column("int", { default: 7 })
  durationDays!: number; // How many days the challenge lasts

  @Column({ type: "boolean", default: false })
  isPaid!: boolean;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ type: "varchar", length: 10, default: "NGN" })
  currency!: string;

  @Column("json", { nullable: true })
  dailyContent?: Array<{
    day: number;
    title: string;
    description?: string;
    lectureUrls?: string[]; // S3 URLs for lecture materials
    quizIds?: string[]; // IDs of exams to use as quizzes
  }>;

  @Column("json", { nullable: true })
  enrolledUsers?: string[]; // User IDs who enrolled

  @ManyToMany(() => User)
  @JoinTable({
    name: "challenge_enrollments",
    joinColumn: { name: "challengeId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "userId", referencedColumnName: "id" },
  })
  users!: User[];

  @ManyToMany(() => Exam)
  @JoinTable({
    name: "challenge_quizzes",
    joinColumn: { name: "challengeId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "examId", referencedColumnName: "id" },
  })
  dailyQuizzes!: Exam[];

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "timestamp", nullable: true })
  startDate?: Date; // When the challenge officially starts

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
