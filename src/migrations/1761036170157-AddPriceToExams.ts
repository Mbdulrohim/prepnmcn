import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriceToExams1761036170157 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "exams"
            ADD COLUMN "price" decimal(10,2) NULL,
            ADD COLUMN "currency" varchar(10) NOT NULL DEFAULT 'NGN'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "exams"
            DROP COLUMN "price",
            DROP COLUMN "currency"
        `);
  }
}
