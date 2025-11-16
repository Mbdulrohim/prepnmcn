import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Exam } from "./Exam";

@Entity("exam_version_snapshots")
export class ExamVersion {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  examId!: string;

  @ManyToOne(() => Exam, { nullable: false })
  @JoinColumn({ name: "examId" })
  exam!: Exam;

  @Column({ type: "json", nullable: true })
  snapshot?: any;

  @Column({ type: "varchar", length: 255, nullable: true })
  note?: string;

  @Column({ type: "uuid", nullable: true })
  publishedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
