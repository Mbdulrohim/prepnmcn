import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAcademicProfileToUser1760600000000
  implements MigrationInterface
{
  name = "AddAcademicProfileToUser1760600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "academicLevel" varchar(10)
        `);

    await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "selectedCourses" json
        `);

    await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "studyPreferences" json
        `);

    await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "notificationSettings" json
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "notificationSettings"
        `);

    await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "studyPreferences"
        `);

    await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "selectedCourses"
        `);

    await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "academicLevel"
        `);
  }
}
