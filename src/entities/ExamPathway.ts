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
import { ExamCategory } from "./ExamCategory";
import { ExamPackage } from "./ExamPackage";

export enum ExamPathwayType {
  RN = "rn",
  RM = "rm",
  RPHN = "rphn",
  NCLEX = "nclex",
  ONLINE_DISTANCE_LEARNING = "online_distance_learning",
  SPECIALTY_POST_BASIC = "specialty_post_basic",
  UNDERGRADUATE = "undergraduate",
  UNDERGRADUATE_RESEARCH = "undergraduate_research",
  POSTGRADUATE_RESEARCH = "postgraduate_research",
  OLEVEL = "olevel",
  JAMB = "jamb",
  RESEARCH_CONSULTATION = "research_consultation",
}

@Entity("exam_pathways")
export class ExamPathway {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({
    type: "enum",
    enum: ExamPathwayType,
  })
  type!: ExamPathwayType;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column("uuid")
  categoryId!: string;

  @ManyToOne(() => ExamCategory)
  @JoinColumn({ name: "categoryId" })
  category!: ExamCategory;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany("exam_packages", "pathway")
  packages!: ExamPackage[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
