import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { getDataSource } from "../../../../lib/database";
// import { User } from "../../../../entities/User";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (
    !session ||
    !["admin", "super_admin"].includes((session.user as any)?.role)
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { getDataSource } = await import("../../../../lib/database");
  const AppDataSource = await getDataSource();
  const { User } = await import("../../../../entities/User");
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
