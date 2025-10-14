import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("institutions")
export class Institution {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 10 })
  code!: string; // Institution code/acronym

  @Column({ type: "varchar", length: 100 })
  state!: string; // State in Nigeria

  @Column({ type: "varchar", length: 100 })
  city!: string; // City location

  @Column({ type: "varchar", length: 50 })
  type!: string; // University, College of Education, Polytechnic, etc.

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
