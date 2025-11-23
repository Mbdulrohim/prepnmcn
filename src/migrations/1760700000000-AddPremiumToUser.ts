import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPremiumToUser1760700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add isPremium column
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "isPremium",
        type: "boolean",
        default: false,
      })
    );

    // Add premiumExpiresAt column
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "premiumExpiresAt",
        type: "timestamp",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "premiumExpiresAt");
    await queryRunner.dropColumn("users", "isPremium");
  }
}
