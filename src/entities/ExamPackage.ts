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
import { ExamPathway } from "./ExamPathway";
import { Exam } from "./Exam";
import { UserEnrollment } from "./UserEnrollment";
import { Challenge } from "./Challenge";

export enum ExamPackageType {
  MONTHLY_SUBSCRIPTION = "monthly_subscription",
  ONE_TIME_PAYMENT = "one_time_payment",
  INSTALLMENT_2X = "installment_2x",
  INSTALLMENT_3X = "installment_3x",
  FLEXIBLE_NEGOTIABLE = "flexible_negotiable",
  FULL_PACKAGE = "full_package",
  PARTIAL_PACKAGE = "partial_package",
}

export enum ExamFrequency {
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  MOCK_EXAM = "mock_exam",
  ONE_TIME = "one_time",
}

@Entity("exam_packages")
export class ExamPackage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column("uuid")
  pathwayId!: string;

  @ManyToOne("ExamPathway")
  @JoinColumn({ name: "pathwayId" })
  pathway!: ExamPathway;

  @Column({
    type: "enum",
    enum: ExamPackageType,
    default: ExamPackageType.MONTHLY_SUBSCRIPTION,
  })
  packageType!: ExamPackageType;

  @Column({
    type: "enum",
    enum: ExamFrequency,
    default: ExamFrequency.MONTHLY,
  })
  frequency!: ExamFrequency;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "varchar", length: 10, default: "NGN" })
  currency!: string;

  @Column({ type: "int", nullable: true })
  installmentCount!: number; // For installment payments

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany("Exam", "package")
  exams!: Exam[];

  @OneToMany("UserEnrollment", "package")
  enrollments!: UserEnrollment[];

  @OneToMany("Challenge", "package")
  challenges!: Challenge[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
