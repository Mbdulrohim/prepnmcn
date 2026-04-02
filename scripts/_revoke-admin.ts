/**
 * One-off script: revoke admin access from gafman66666133@gmail.com
 * Usage: npx tsx scripts/_revoke-admin.ts
 */
import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { DataSource } from "typeorm";

async function main() {
  const ds = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: true,
    extra: { ssl: { rejectUnauthorized: false } },
    entities: [],
    synchronize: false,
  });

  await ds.initialize();

  const email = "gafman66666133@gmail.com";

  // Check current role
  const before = await ds.query(
    `SELECT id, email, role FROM users WHERE email = $1`,
    [email],
  );

  if (before.length === 0) {
    console.log("User not found:", email);
    await ds.destroy();
    process.exit(1);
  }

  console.log("Found:", before[0].email, "| current role:", before[0].role);

  // Update role to user
  await ds.query(`UPDATE users SET role = 'user' WHERE email = $1`, [email]);

  const after = await ds.query(
    `SELECT id, email, role FROM users WHERE email = $1`,
    [email],
  );
  console.log("Done — updated role:", after[0].role);

  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
