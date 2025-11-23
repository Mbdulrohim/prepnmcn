import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Only super_admin can promote to admin
    if (!session?.user || (session.user as any).role !== "super_admin") {
      return NextResponse.json(
        { message: "Unauthorized. Super admin access required." },
        { status: 403 }
      );
    }

    const { id: userId } = await params;

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role === "admin" || user.role === "super_admin") {
      return NextResponse.json(
        { message: "User is already an admin" },
        { status: 400 }
      );
    }

    // Promote user to admin
    user.role = "admin";
    await userRepo.save(user);

    return NextResponse.json({
      message: "User promoted to admin successfully",
      requiresSignOut: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
