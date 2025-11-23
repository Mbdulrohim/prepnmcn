import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";

export const runtime = "nodejs";

// DELETE - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Only super_admin can delete users
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

    // Prevent deleting super admins
    if (user.role === "super_admin") {
      return NextResponse.json(
        { message: "Cannot delete super admin users" },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (user.id === session.user.id) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 403 }
      );
    }

    await userRepo.remove(user);

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update user (toggle active status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Only admins can update users
    if (
      !session?.user ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json(
        { message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { message: "isActive field is required and must be a boolean" },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent deactivating super admins
    if (user.role === "super_admin" && !isActive) {
      return NextResponse.json(
        { message: "Cannot deactivate super admin users" },
        { status: 403 }
      );
    }

    // Prevent self-deactivation
    if (user.id === session.user.id && !isActive) {
      return NextResponse.json(
        { message: "Cannot deactivate your own account" },
        { status: 403 }
      );
    }

    user.isActive = isActive;
    await userRepo.save(user);

    return NextResponse.json({
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
