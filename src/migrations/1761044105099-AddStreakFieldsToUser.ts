import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStreakFieldsToUser1761044105099 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "currentStreak" integer NOT NULL DEFAULT '0'
        `);

    await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "longestStreak" integer NOT NULL DEFAULT '0'
        `);

    await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "lastActivityDate" date
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "lastActivityDate"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "longestStreak"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "currentStreak"`);
  }
}
