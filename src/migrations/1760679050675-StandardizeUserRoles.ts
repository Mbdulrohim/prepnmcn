import { MigrationInterface, QueryRunner } from "typeorm";

export class StandardizeUserRoles1760679050675 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert any 'student' roles to 'user'
    await queryRunner.query(
      `UPDATE "user" SET "role" = 'user' WHERE "role" = 'student'`
    );

    // Convert any invalid roles to 'user'
    await queryRunner.query(
      `UPDATE "user" SET "role" = 'user' WHERE "role" NOT IN ('user', 'admin', 'super_admin')`
    );

    console.log(
      "Standardized user roles: converted 'student' and invalid roles to 'user'"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No down migration needed as this is a data cleanup
  }
}
