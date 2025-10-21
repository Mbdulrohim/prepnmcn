import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateExamEnrollmentsTable1761044988021
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
            CREATE TYPE "exam_enrollments_status_enum" AS ENUM(
                'enrolled',
                'in_progress',
                'completed',
                'cancelled'
            )
        `);

    await queryRunner.query(`
            CREATE TYPE "exam_enrollments_paymentstatus_enum" AS ENUM(
                'pending',
                'completed',
                'failed',
                'refunded'
            )
        `);

    // Create exam_enrollments table
    await queryRunner.query(`
            CREATE TABLE "exam_enrollments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "examId" uuid NOT NULL,
                "status" "exam_enrollments_status_enum" NOT NULL DEFAULT 'enrolled',
                "paymentStatus" "exam_enrollments_paymentstatus_enum" NOT NULL DEFAULT 'pending',
                "amountPaid" numeric(10,2),
                "currency" character varying(10) NOT NULL DEFAULT 'NGN',
                "enrolledAt" TIMESTAMP,
                "completedAt" TIMESTAMP,
                "attemptsUsed" integer NOT NULL DEFAULT 0,
                "maxAttempts" integer NOT NULL DEFAULT 3,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_exam_enrollments" PRIMARY KEY ("id")
            )
        `);

    // Create indexes
    await queryRunner.query(`
            CREATE INDEX "IDX_exam_enrollments_userId" ON "exam_enrollments" ("userId")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_exam_enrollments_examId" ON "exam_enrollments" ("examId")
        `);

    // Create foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "exam_enrollments"
            ADD CONSTRAINT "FK_exam_enrollments_userId"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "exam_enrollments"
            ADD CONSTRAINT "FK_exam_enrollments_examId"
            FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "exam_enrollments" DROP CONSTRAINT "FK_exam_enrollments_examId"`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_enrollments" DROP CONSTRAINT "FK_exam_enrollments_userId"`
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_exam_enrollments_examId"`);
    await queryRunner.query(`DROP INDEX "IDX_exam_enrollments_userId"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "exam_enrollments"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "exam_enrollments_paymentstatus_enum"`);
    await queryRunner.query(`DROP TYPE "exam_enrollments_status_enum"`);
  }
}
