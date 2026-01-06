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

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  CARD = "card",
  BANK_TRANSFER = "bank_transfer",
  PAYPAL = "paypal",
  OTHER = "other",
}

export enum PaymentType {
  PROGRAM_ENROLLMENT = "program_enrollment",
  EXAM_PACKAGE = "exam_package",
  COURSE_ENROLLMENT = "course_enrollment",
  OTHER = "other",
}

export enum ApprovalStatus {
  NOT_REQUIRED = "not_required",
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("decimal", { precision: 10, scale: 2 })
  amount!: number;

  @Column("varchar", { length: 3, default: "USD" })
  currency!: string;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({
    type: "enum",
    enum: PaymentMethod,
    default: PaymentMethod.CARD,
  })
  method!: PaymentMethod;

  @Column("text", { nullable: true })
  description!: string;

  @Column("varchar", { nullable: true })
  transactionId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Multi-program support fields
  @Column({ type: "json", nullable: true })
  programIds?: string[]; // Array of program IDs for multi-program purchases

  @Column({
    type: "enum",
    enum: PaymentType,
    default: PaymentType.OTHER,
  })
  paymentType!: PaymentType;

  @Column({
    type: "enum",
    enum: ApprovalStatus,
    default: ApprovalStatus.NOT_REQUIRED,
  })
  approvalStatus!: ApprovalStatus;

  @Column("uuid", { nullable: true })
  approvedBy?: string; // Admin user ID who approved manual payment

  @Column("timestamp", { nullable: true })
  approvedAt?: Date;

  @Column("text", { nullable: true })
  approvalNotes?: string; // Admin notes for approval/rejection

  @Column("text", { nullable: true })
  paymentProof?: string; // URL or reference for manual payment proof
}
