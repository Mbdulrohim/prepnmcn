import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

export enum ProgramCode {
  RM = "RM",
  RN = "RN",
  RPHN = "RPHN",
  SPECIALTY = "SPECIALTY",
}

@Entity("programs")
export class Program {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: 50,
    unique: true,
  })
  code!: ProgramCode;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ type: "varchar", length: 3, default: "NGN" })
  currency!: string;

  @Column({ type: "int", default: 12 })
  durationMonths!: number; // Default enrollment duration in months

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "json", nullable: true })
  metadata?: {
    features?: string[];
    icon?: string;
    color?: string;
    displayOrder?: number;
  };

  @OneToMany("user_program_enrollments", "program")
  enrollments!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
