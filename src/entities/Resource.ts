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
import { Program } from "./Program";

@Entity("resources")
@Index(["programId"])
export class Resource {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "text" })
  contentText!: string;

  @Column({ type: "boolean", default: true })
  isFree!: boolean;

  @Column({ type: "varchar", length: 500, nullable: true })
  fileUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Multi-program support
  @Column({ type: "uuid", nullable: true })
  programId?: string;

  @ManyToOne(() => Program, { nullable: true })
  @JoinColumn({ name: "programId" })
  program?: Program;

  @Column({ type: "boolean", default: false })
  isGlobal!: boolean; // If true, available to all programs
}
