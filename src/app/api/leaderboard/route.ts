import { NextResponse } from "next/server";
import { AppDataSource } from "../../../lib/database";
import { User } from "../../../entities/User";

export async function GET() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const userRepo = AppDataSource.getRepository(User);

  // Aggregate points by institution
  const result = await userRepo
    .createQueryBuilder("user")
    .select("user.institution", "institution")
    .addSelect("SUM(user.points)", "points") // Assume points field exists
    .groupBy("user.institution")
    .orderBy("SUM(user.points)", "DESC")
    .getRawMany();

  return NextResponse.json(result);
}
