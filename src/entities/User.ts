import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Institution } from "./Institution";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  password?: string;

  @ManyToOne(() => Institution, { nullable: true })
  @JoinColumn({ name: "institutionId" })
  institution?: Institution;

  @Column({ type: "uuid", nullable: true })
  institutionId?: string;

  @Column({ type: "int", default: 0 })
  points!: number;

  @Column({ type: "varchar", length: 50, default: "user" })
  role!: string; // 'user', 'admin', 'super_admin'

  @Column({ type: "json", nullable: true, default: [] })
  permissions!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}