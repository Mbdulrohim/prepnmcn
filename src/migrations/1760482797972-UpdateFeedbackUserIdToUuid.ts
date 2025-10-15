import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFeedbackUserIdToUuid1760482797972
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change userId column from int to uuid
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ALTER COLUMN "userId" TYPE uuid USING "userId"::text::uuid`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Change userId column back from uuid to int
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ALTER COLUMN "userId" TYPE int USING "userId"::text::int`
    );
  }
}
