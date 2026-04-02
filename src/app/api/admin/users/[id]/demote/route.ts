import { NextResponse } from "next/server";
import { auth } from "../../../../../../lib/auth";
import { getDataSource } from "../../../../../../lib/database";
import { User } from "../../../../../../entities/User";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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

    const callerRole = (session.user as any)?.role;
    const callerId = (session.user as any)?.id;

    // Prevent self-demotion
    if (userId === callerId) {
      return NextResponse.json(
        { message: "You cannot demote yourself" },
        { status: 403 },
      );
    }

    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Only super_admin can demote another super_admin
    if (user.role === "super_admin" && callerRole !== "super_admin") {
      return NextResponse.json(
        { message: "Only a super admin can demote another super admin" },
        { status: 403 },
      );
    }

    // Update user role to user
    user.role = "user";
    await userRepo.save(user);

    return NextResponse.json({
      message: "User has been demoted to regular user successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error demoting user:", error);
    return NextResponse.json(
      { message: "Error demoting user" },
      { status: 500 },
    );
  }
}
