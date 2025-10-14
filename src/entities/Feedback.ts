import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("feedbacks")
export class Feedback {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("text")
  message!: string;

  @Column({ type: "varchar", length: 20, default: "unread" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
