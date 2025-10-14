import { NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { getDataSource } from "../../../../lib/database";
import { User } from "../../../../entities/User";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET() {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find({
      relations: ["institution"],
    });

    const formattedUsers = users.map((user) => ({
      ...user,
      institution: user.institution ? user.institution.name : "N/A",
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}
