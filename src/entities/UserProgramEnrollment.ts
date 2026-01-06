import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Program } from "./Program";

export enum PaymentMethod {
  ONLINE = "online",
  MANUAL = "manual",
}

export enum EnrollmentStatus {
  PENDING_APPROVAL = "pending_approval",
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
}

@Entity("user_program_enrollments")
@Index(["userId", "programId"])
@Index(["userId", "status"])
@Index(["programId", "status"])
@Index(["expiresAt"])
export class UserProgramEnrollment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  userId!: string;

  @ManyToOne(() => User, (user) => user.enrollments)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid")
  programId!: string;

  @ManyToOne(() => Program, (program) => program.enrollments)
  @JoinColumn({ name: "programId" })
  program!: Program;

  @Column({
    type: "enum",
    enum: PaymentMethod,
    default: PaymentMethod.ONLINE,
  })
  paymentMethod!: PaymentMethod;

  @Column({
    type: "enum",
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status!: EnrollmentStatus;

  @Column({ type: "timestamp", nullable: true })
  expiresAt?: Date | null;

  @Column({ type: "uuid", nullable: true })
  approvedBy?: string; // Admin user ID who approved manual payment

  @Column({ type: "timestamp", nullable: true })
  approvedAt?: Date | null;

  @Column({ type: "uuid", nullable: true })
  paymentId?: string; // Reference to Payment entity

  @Column({ type: "text", nullable: true })
  notes?: string; // Admin notes for manual approvals

  @CreateDateColumn()
  enrollmentDate!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper method to check if enrollment is active and not expired
  isCurrentlyActive(): boolean {
    if (this.status !== EnrollmentStatus.ACTIVE) {
      return false;
    }
    if (this.expiresAt && new Date() > new Date(this.expiresAt)) {
      return false;
    }
    return true;
  }
}
