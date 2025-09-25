import "reflect-metadata";
import { AppDataSource } from "./database";

export default async function handler() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log("Database connected successfully");
    // Add any initial setup here
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}
