import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const AppDataSource = await getDataSource();

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: (session.user as any).id },
      relations: ["institution"],
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        institution: user.institution ? user.institution.name : "N/A",
        role: user.role,
        points: user.points,
        permissions: user.permissions || [],
      },
    });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
