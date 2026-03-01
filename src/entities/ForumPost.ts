import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Forum } from "./Forum";

@Entity("forum_posts")
@Index(["forumId", "createdAt"])
@Index(["userId"])
@Index(["parentPostId"])
export class ForumPost {
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

  @Column({ type: "text" })
  content!: string;

  /**
   * If set, this post is a reply to the parent post.
   */
  @Column({ type: "uuid", nullable: true })
  parentPostId?: string | null;

  @ManyToOne(() => ForumPost, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "parentPostId" })
  parentPost?: ForumPost;

  @Column({ type: "boolean", default: false })
  isDeleted!: boolean;

  @Column({ type: "boolean", default: false })
  isPinned!: boolean;

  @Column({
    type: "json",
    nullable: true,
  })
  metadata?: {
    editedAt?: string;
    attachments?: string[];
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
