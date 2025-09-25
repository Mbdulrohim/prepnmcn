import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { EmailCode } from "../entities/EmailCode";
import { Feedback } from "../entities/Feedback";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, // Enable synchronize for development
  logging: process.env.NODE_ENV === "development",
  entities: [User, EmailCode, Feedback],
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});
