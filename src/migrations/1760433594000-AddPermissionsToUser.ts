import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPermissionsToUser1760433594000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "permissions" json DEFAULT '[]'`
    );
    await queryRunner.query(
      `UPDATE "users" SET "role" = 'user' WHERE "role" = 'student'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "permissions"`);
  }
}
