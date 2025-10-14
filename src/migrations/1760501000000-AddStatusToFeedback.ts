import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToFeedback1760501000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD "status" varchar(20) DEFAULT 'unread'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feedbacks" DROP COLUMN "status"`);
  }
}
