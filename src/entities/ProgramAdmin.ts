import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { User } from "./User";
import { Program } from "./Program";

@Entity("program_admins")
@Unique(["userId", "programId"])
@Index(["userId"])
@Index(["programId"])
export class ProgramAdmin {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid")
  programId!: string;

  @ManyToOne(() => Program)
  @JoinColumn({ name: "programId" })
  program!: Program;

  @Column("uuid", { nullable: true })
  assignedBy?: string; // Super admin ID who assigned this admin

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "timestamp", nullable: true })
  assignedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
