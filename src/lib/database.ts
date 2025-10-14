import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { EmailCode } from "../entities/EmailCode";
import { Feedback } from "../entities/Feedback";
import { Institution } from "../entities/Institution";
import { Resource } from "../entities/Resource";
import { Payment } from "../entities/Payment";

let AppDataSource: DataSource;

export async function getDataSource(): Promise<DataSource> {
  if (AppDataSource && AppDataSource.isInitialized) {
    return AppDataSource;
  }

  AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: process.env.NODE_ENV === "development",
    entities: [User, EmailCode, Feedback, Institution, Resource, Payment],
    ssl:
      process.env.NODE_ENV === "production"
        ? true
        : { rejectUnauthorized: false },
  });

  await AppDataSource.initialize();
  return AppDataSource;
}

export { AppDataSource };
