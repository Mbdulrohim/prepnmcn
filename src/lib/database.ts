import { DataSource } from "typeorm";

let AppDataSource: DataSource;

export async function getDataSource(): Promise<DataSource> {
  if (AppDataSource && AppDataSource.isInitialized) {
    return AppDataSource;
  }

  // Import reflect-metadata dynamically to avoid bundling issues
  await import("reflect-metadata");

  // Lazy load entities to avoid circular dependencies
  const entities = await Promise.all([
    import("../entities/User").then((m) => m.User),
    import("../entities/EmailCode").then((m) => m.EmailCode),
    import("../entities/Feedback").then((m) => m.Feedback),
    import("../entities/Institution").then((m) => m.Institution),
    import("../entities/Resource").then((m) => m.Resource),
    import("../entities/Payment").then((m) => m.Payment),
    import("../entities/AutomationRule").then((m) => m.AutomationRule),
    import("../entities/Notification").then((m) => m.Notification),
  ]);

  AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: process.env.NODE_ENV === "development",
    entities: entities,
    ssl:
      process.env.NODE_ENV === "production"
        ? true
        : { rejectUnauthorized: false },
  });

  await AppDataSource.initialize();
  return AppDataSource;
}
