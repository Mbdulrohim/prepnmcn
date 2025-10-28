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
import { User } from "./User";

export enum AccessCodeType {
  EXAM_PACKAGE = "exam_package",
  CHALLENGE = "challenge",
  PREMIUM_ACCESS = "premium_access",
  RM = "rm", // Temporary for existing invalid data
}

@Entity("access_codes")
export class AccessCode {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50, unique: true, nullable: true })
  code?: string; // The actual access code

  @Column({
    type: "enum",
    enum: AccessCodeType,
    nullable: true,
    default: AccessCodeType.PREMIUM_ACCESS,
  })
  type?: AccessCodeType;

  @Column("uuid", { nullable: true })
  targetId?: string; // ID of the exam package, challenge, or null for premium

  @Column("int", { default: 1 })
  maxUses!: number; // Maximum number of times this code can be used

  @Column("int", { default: 0 })
  currentUses!: number; // How many times it's been used

  @Column({ type: "timestamp", nullable: true })
  expiresAt?: Date;

  @Column("uuid", { nullable: true })
  createdBy?: string; // Admin user who created this code

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "createdBy" })
  creator?: User;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column("json", { nullable: true })
  usedBy?: Array<{
    userId: string;
    usedAt: Date;
  }>; // Track who used it and when

  @ManyToMany(() => User)
  @JoinTable({
    name: "access_code_usage",
    joinColumn: { name: "accessCodeId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "userId", referencedColumnName: "id" },
  })
  users!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
