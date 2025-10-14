import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPermissionsToUser1760433594 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "permissions" json DEFAULT '[]'`
    );
    await queryRunner.query(
      `UPDATE "user" SET "role" = 'user' WHERE "role" = 'student'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "permissions"`);
  }
}
