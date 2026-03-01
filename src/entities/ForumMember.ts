import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { User } from "./User";
import { Forum } from "./Forum";

@Entity("forum_members")
@Unique(["forumId", "userId"])
@Index(["userId"])
@Index(["forumId"])
export class ForumMember {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  forumId!: string;

  @ManyToOne(() => Forum, { onDelete: "CASCADE" })
  @JoinColumn({ name: "forumId" })
  forum!: Forum;

  @Column("uuid")
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "boolean", default: false })
  isMuted!: boolean;

  @CreateDateColumn()
  joinedAt!: Date;
}
