import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Exam } from "./Exam";

export enum ExamCategoryType {
  JAMB = "jamb",
  WAEC = "waec",
  NECO = "neco",
  POST_UTME = "post_utme",
  OTHER = "other",
}

@Entity("exam_categories")
export class ExamCategory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: ExamCategoryType,
    default: ExamCategoryType.OTHER,
  })
  type: ExamCategoryType;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @OneToMany(() => Exam, (exam) => exam.category)
  exams: Exam[];
}
