import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateResourceFileUrl1760508098861 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resources" RENAME COLUMN "originalFilePath" TO "fileUrl"`
    );
    await queryRunner.query(
      `ALTER TABLE "resources" ALTER COLUMN "fileUrl" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resources" ALTER COLUMN "fileUrl" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "resources" RENAME COLUMN "fileUrl" TO "originalFilePath"`
    );
  }
}
