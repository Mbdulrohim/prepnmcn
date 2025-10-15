import { NextResponse } from "next/server";
import { auth } from "../../../../../../lib/auth";
import { getDataSource } from "../../../../../../lib/database";
import { User } from "../../../../../../entities/User";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = id;
    if (!userId) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update user role to admin
    user.role = "admin";
    await userRepo.save(user);

    return NextResponse.json({
      message: "User promoted to admin successfully. The user will need to sign out and sign back in to access admin features.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      requiresSignOut: true,
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json(
      { message: "Error promoting user" },
      { status: 500 }
    );
  }
}
