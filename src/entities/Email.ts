import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("emails")
export class Email {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  messageId!: string;

  @Column({ type: "varchar", length: 255 })
  from!: string;

  @Column({ type: "json" })
  to!: string[];

  @Column({ type: "varchar", length: 255 })
  subject!: string;

  @Column({ type: "text", nullable: true })
  textBody?: string;

  @Column({ type: "text", nullable: true })
  htmlBody?: string;

  @Column({ type: "json", nullable: true })
  attachments?: any[];

  @Column({ type: "timestamp" })
  receivedAt!: Date;

  @Column({ type: "boolean", default: false })
  isRead!: boolean;

  @Column({ type: "boolean", default: false })
  isArchived!: boolean;

  @Column({ type: "varchar", length: 50, default: "inbox" })
  folder!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
