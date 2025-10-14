import { DataSource } from "typeorm";
import { User } from "./src/entities/User";
import { EmailCode } from "./src/entities/EmailCode";
import { Feedback } from "./src/entities/Feedback";
import { Institution } from "./src/entities/Institution";
import { Resource } from "./src/entities/Resource";
import { Payment } from "./src/entities/Payment";
import { AutomationRule } from "./src/entities/AutomationRule";

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [
    User,
    EmailCode,
    Feedback,
    Institution,
    Resource,
    Payment,
    AutomationRule,
  ],
});
