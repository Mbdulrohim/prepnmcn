import { NextResponse } from "next/server";
import { AppDataSource } from "../../../lib/database";
import { User } from "../../../entities/User";
import { Institution } from "../../../entities/Institution";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const userRepo = AppDataSource.getRepository(User);

  // Aggregate points by institution, joining with Institution table
  const result = await userRepo
    .createQueryBuilder("user")
    .leftJoin(Institution, "inst", "user.institutionId = inst.id")
    .select("inst.name", "institution")
    .addSelect("SUM(user.points)", "points")
    .addSelect("COUNT(user.id)", "userCount")
    .where("inst.isActive = :isActive", { isActive: true })
    .andWhere("user.points > 0")
    .groupBy("inst.id")
    .addGroupBy("inst.name")
    .orderBy("SUM(user.points)", "DESC")
    .getRawMany();

  return NextResponse.json(result);
}
