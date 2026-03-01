import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";

@Entity("forums")
@Index(["slug"], { unique: true })
@Index(["programId"])
@Index(["isActive"])
export class Forum {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  slug!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  /**
   * If set, only users with an ACTIVE enrollment in this program can access.
   * If null, the forum is open to all logged-in users (or all actively enrolled users
   * depending on isOpenToAll flag below).
   */
  @Column({ type: "uuid", nullable: true })
  programId?: string | null;

  /**
   * If true, any authenticated user can join (no program requirement).
   * If false and programId is null, any enrolled user (in any program) can join.
   * If false and programId is set, only that program's active enrollees can join.
   */
  @Column({ type: "boolean", default: false })
  isOpenToAll!: boolean;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "boolean", default: false })
  isPinned!: boolean;

  @Column({ type: "uuid", nullable: true })
  createdByUserId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "createdByUserId" })
  createdBy?: User;

  @Column({
    type: "json",
    nullable: true,
  })
  metadata?: {
    icon?: string;
    color?: string;
    coverImage?: string;
    rules?: string;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
