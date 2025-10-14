import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("automation_rules")
export class AutomationRule {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({
    type: "enum",
    enum: ["user_registration", "feedback_submitted", "study_plan_created", "custom"],
  })
  trigger!: "user_registration" | "feedback_submitted" | "study_plan_created" | "custom";

  @Column({ type: "json" })
  conditions!: Record<string, unknown>;

  @Column({ type: "json" })
  template!: {
    subject: string;
    body: string;
  };

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}