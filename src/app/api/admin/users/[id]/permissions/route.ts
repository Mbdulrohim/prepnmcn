import { NextResponse } from "next/server";
import { auth } from "../../../../../../lib/auth";
import { getDataSource } from "../../../../../../lib/database";
import { User } from "../../../../../../entities/User";

export const runtime = "nodejs";

export async function PUT(
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

    const body = await request.json();
    const { permissions } = body;

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { message: "Permissions must be an array" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update user permissions
    user.permissions = permissions;
    await userRepo.save(user);

    return NextResponse.json({
      message: "Permissions updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    return NextResponse.json(
      { message: "Error updating permissions" },
      { status: 500 }
    );
  }
}
