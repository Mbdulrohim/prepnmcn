import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET() {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);
    const admins = await userRepo.find({
      where: [{ role: "admin" }, { role: "super_admin" }],
      relations: ["institution"],
    });

    const formattedAdmins = admins.map((admin) => ({
      ...admin,
      institution: admin.institution ? admin.institution.name : "N/A",
      isActive: true, // Assume all admins are active for now
      lastLogin: admin.updatedAt.toISOString(), // Use updatedAt as proxy for last activity
    }));

    return NextResponse.json(formattedAdmins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { message: "Error fetching admins" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { email, role } = await req.json();
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    if (!role || !["admin", "super_admin"].includes(role)) {
      return NextResponse.json(
        { message: "Valid role (admin or super_admin) is required" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.role = role;
    await userRepo.save(user);

    return NextResponse.json({ message: `User ${email} is now a ${role}.` });
  } catch (error) {
    console.error("Error making user admin:", error);
    return NextResponse.json(
      { message: "Error making user admin" },
      { status: 500 }
    );
  }
}
