import { getDataSource } from "./database";

export default async function handler() {
  try {
    // Import reflect-metadata dynamically
    await import("reflect-metadata");

    const AppDataSource = await getDataSource();
    console.log("Database connected successfully");
    // Add any initial setup here
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}
