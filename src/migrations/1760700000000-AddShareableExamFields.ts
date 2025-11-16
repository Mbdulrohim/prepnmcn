import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddShareableExamFields1760700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "exams",
      new TableColumn({
        name: "isShareable",
        type: "boolean",
        default: false,
      })
    );

    await queryRunner.addColumn(
      "exams",
      new TableColumn({
        name: "shareSlug",
        type: "varchar",
        length: "100",
        isNullable: true,
        isUnique: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("exams", "shareSlug");
    await queryRunner.dropColumn("exams", "isShareable");
  }
}
