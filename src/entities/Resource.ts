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
@Index(["shareSlug"], { unique: true, where: '"shareSlug" IS NOT NULL' })
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

  // Shareable resource support
  @Column({ type: "boolean", default: false })
  isShareable!: boolean;

  @Column({ type: "varchar", length: 100, unique: true, nullable: true })
  shareSlug?: string;

  // Visibility control - hidden resources are not shown to students
  @Column({ type: "boolean", default: false })
  isHidden!: boolean;
}
