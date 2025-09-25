import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function testDatabaseConnection() {
  console.log("Testing database connection...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Database connection successful!");

    // Check if database exists
    const result = await client.query("SELECT current_database()");
    console.log("Current database:", result.rows[0].current_database);

    // List all databases
    const dbResult = await client.query(`
      SELECT datname FROM pg_database
      WHERE datistemplate = false
      ORDER BY datname
    `);
    console.log(
      "Available databases:",
      dbResult.rows.map((row) => row.datname)
    );

    await client.end();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Error details:", error);
  }
}

testDatabaseConnection();
