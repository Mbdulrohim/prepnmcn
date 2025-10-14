import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("email_codes")
export class EmailCode {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 6 })
  code!: string; // 6-digit verification code

  @Column({ type: "timestamp" })
  expiresAt!: Date; // Codes expire after 10 minutes

  @Column({ type: "boolean", default: false })
  used!: boolean; // Mark as used after successful login

  @CreateDateColumn()
  createdAt!: Date;
}
