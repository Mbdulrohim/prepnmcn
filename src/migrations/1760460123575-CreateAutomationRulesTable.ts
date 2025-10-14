import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAutomationRulesTable1760460123575
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "automation_rules",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "trigger",
            type: "enum",
            enum: [
              "user_registration",
              "feedback_submitted",
              "study_plan_created",
              "custom",
            ],
            isNullable: false,
          },
          {
            name: "conditions",
            type: "json",
            isNullable: false,
          },
          {
            name: "template",
            type: "json",
            isNullable: false,
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
            isNullable: false,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("automation_rules");
  }
}
