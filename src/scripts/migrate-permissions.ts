import { getDataSource } from "../lib/database";

async function runMigration() {
  try {
    const dataSource = await getDataSource();
    console.log("Connected to database");

    // Add permissions column if it doesn't exist
    await dataSource.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS "permissions" json DEFAULT '[]'
    `);

    // Update any 'student' roles to 'user'
    await dataSource.query(`
      UPDATE "user"
      SET "role" = 'user'
      WHERE "role" = 'student'
    `);

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
