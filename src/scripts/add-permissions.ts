const { getDataSource } = require("../lib/database");

const addPermissionsColumn = async () => {
  try {
    const AppDataSource = await getDataSource();

    // Check if permissions column exists
    const queryRunner = AppDataSource.createQueryRunner();
    const table = await queryRunner.getTable("user");

    const permissionsColumn = table.columns.find(
      (col: any) => col.name === "permissions"
    );

    if (!permissionsColumn) {
      console.log("Adding permissions column...");
      await queryRunner.query(
        `ALTER TABLE "user" ADD "permissions" json DEFAULT '[]'`
      );
      console.log("Permissions column added successfully!");
    } else {
      console.log("Permissions column already exists.");
    }

    // Update any 'student' roles to 'user'
    await queryRunner.query(
      `UPDATE "user" SET "role" = 'user' WHERE "role" = 'student'`
    );
    console.log("Updated student roles to user roles.");

    await queryRunner.release();
  } catch (error) {
    console.error("Error adding permissions column:", error);
  } finally {
    // Note: getDataSource might handle connection closing automatically
  }
};

addPermissionsColumn();
