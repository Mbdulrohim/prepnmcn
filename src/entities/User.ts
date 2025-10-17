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
import { USER_ROLES, UserRole } from "@/lib/roles";
import type { UserRole as UserRoleType } from "@/lib/roles";

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

  @Column({
    type: "varchar",
    length: 50,
    default: USER_ROLES.USER,
  })
  role!: UserRoleType; // 'user', 'admin', 'super_admin'

  @Column({ type: "json", nullable: true, default: [] })
  permissions!: string[];

  // Academic Profile Fields
  @Column({ type: "varchar", length: 10, nullable: true })
  academicLevel!: "100" | "200" | "300" | "400" | "500" | "600" | null;

  @Column({ type: "json", nullable: true })
  selectedCourses!:
    | {
        courseCode: string;
        courseName: string;
        creditHours: number;
        semester: "first" | "second";
      }[]
    | null;

  @Column({ type: "json", nullable: true })
  studyPreferences!: {
    dailyStudyHours: number;
    preferredStudyTimes: string[]; // ["morning", "afternoon", "evening"]
    learningStyle: "visual" | "auditory" | "kinesthetic" | "reading";
    breakFrequency: number; // minutes between breaks
  } | null;

  @Column({ type: "json", nullable: true })
  notificationSettings!: {
    studyReminders: boolean;
    assessmentDeadlines: boolean;
    motivationalMessages: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    reminderFrequency: "daily" | "weekly" | "custom";
  } | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
