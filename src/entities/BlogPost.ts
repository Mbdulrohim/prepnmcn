import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("blog_posts")
export class BlogPost {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "text" })
  excerpt!: string;

  @Column({ type: "varchar", length: 255 })
  author!: string;

  @Column({ type: "varchar", length: 100 })
  category!: string;

  @Column({ type: "simple-array" })
  tags!: string[];

  @Column({ type: "varchar", length: 500, nullable: true })
  imageUrl!: string;

  @Column({ type: "boolean", default: false })
  isPublished!: boolean;

  @Column({ type: "timestamp", nullable: true })
  publishedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
