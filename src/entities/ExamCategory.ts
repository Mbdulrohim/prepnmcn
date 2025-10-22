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

export enum ExamCategoryType {
  PATHWAYS = "pathways",
  RESEARCH = "research",
  OLEVEL_JAMB = "olevel_jamb",
  CONSULTATION = "consultation",
  FUTURE_SERVICES = "future_services",
}

@Entity("exam_categories")
export class ExamCategory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({
    type: "enum",
    enum: ExamCategoryType,
  })
  type!: ExamCategoryType;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany("ExamPathway", "category")
  pathways!: ExamPathway[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
