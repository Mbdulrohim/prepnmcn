import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Exam } from "./Exam";

export enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  TRUE_FALSE = "true_false",
  ESSAY = "essay",
  SHORT_ANSWER = "short_answer",
  FILL_BLANKS = "fill_blanks",
}

@Entity("questions")
export class Question {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  examId!: string;

  @ManyToOne("Exam")
  @JoinColumn({ name: "examId" })
  exam!: Exam;

  @Column({ type: "text" })
  question!: string;

  @Column({
    type: "enum",
    enum: QuestionType,
    default: QuestionType.MULTIPLE_CHOICE,
  })
  type!: QuestionType;

  @Column("json", { nullable: true })
  options?: string[]; // For multiple choice questions

  @Column({ type: "text", nullable: true })
  correctAnswer?: string;

  @Column({ type: "text", nullable: true })
  explanation?: string;

  @Column({ type: "int", default: 1 })
  marks!: number;

  @Column({ type: "int", default: 0 })
  order!: number; // Question order in exam

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "uuid", nullable: true })
  uploadedFileId?: string; // Reference to uploaded file if parsed

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
