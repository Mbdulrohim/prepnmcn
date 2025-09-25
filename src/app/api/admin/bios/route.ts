import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "../../../../lib/database";
import { User } from "../../../../entities/User";

export async function GET() {
  // TODO: Check if admin
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const userRepo = AppDataSource.getRepository(User);

  const users = await userRepo.find({
    select: ["name", "institution", "email", "createdAt"],
    order: { name: "ASC" },
  });

  // Generate simple text file for now
  const data = users
    .map((u) => `${u.name},${u.institution},${u.email},${u.createdAt}`)
    .join("\n");
  const headers = new Headers();
  headers.set("Content-Type", "text/csv");
  headers.set("Content-Disposition", "attachment; filename=student_bios.csv");

  return new NextResponse(data, { headers });
}
