import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

async function standardizeUserRoles() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? true
        : { rejectUnauthorized: false },
  });

  try {
    console.log("🔄 Connecting to database...");

    // Convert any 'student' roles to 'user'
    const studentResult = await pool.query(
      `UPDATE "users" SET "role" = $1 WHERE "role" = $2`,
      ["user", "student"]
    );
    console.log(
      `✅ Converted ${studentResult.rowCount} 'student' roles to 'user'`
    );

    // Convert any invalid roles to 'user'
    const invalidResult = await pool.query(
      `UPDATE "users" SET "role" = $1 WHERE "role" NOT IN ($2, $3, $4)`,
      ["user", "user", "admin", "super_admin"]
    );
    console.log(
      `✅ Converted ${invalidResult.rowCount} invalid roles to 'user'`
    );

    console.log("🎉 User role standardization completed successfully!");
    console.log(
      `📊 Summary: ${studentResult.rowCount} students + ${invalidResult.rowCount} invalid roles → users`
    );
  } catch (error) {
    console.error("❌ Error standardizing user roles:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

standardizeUserRoles();
