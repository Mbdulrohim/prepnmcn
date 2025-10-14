import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50 })
  type!: "email" | "automation";

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  recipientEmail?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  recipientRole?: string;

  @Column({ type: "timestamp", nullable: true })
  sentAt?: Date;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: "sent" | "pending" | "failed";

  @Column({ type: "text", nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
