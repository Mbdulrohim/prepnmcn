import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { getDataSource } from "../../../../../lib/database";
import { User } from "../../../../../entities/User";

export const runtime = "nodejs"; // Force Node.js runtime

export async function DELETE(
  request: NextRequest,
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

    // Prevent admin from deleting themselves
    if (session.user?.id === userId) {
      return NextResponse.json(
        { message: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);

    // Check if user exists
    const user = await userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent deleting super admin users unless you're also a super admin
    if (
      user.role === "super_admin" &&
      (session.user as any)?.role !== "super_admin"
    ) {
      return NextResponse.json(
        { message: "Only super admins can delete other super admins" },
        { status: 403 }
      );
    }

    // Delete the user
    await userRepo.delete(userId);

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user" },
      { status: 500 }
    );
  }
}
