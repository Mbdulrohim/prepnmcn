import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Institution } from "@/entities/Institution";

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
    const institutionRepo = AppDataSource.getRepository(Institution);
    const institutions = await institutionRepo.find({
      order: { createdAt: "DESC" },
    });

    return NextResponse.json({
      success: true,
      data: institutions,
    });
  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json(
      { message: "Error fetching institutions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, code, state, city, type } = await req.json();

    if (!name || !code || !state || !city || !type) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const institutionRepo = AppDataSource.getRepository(Institution);

    // Check if institution with same name or code already exists
    const existingInstitution = await institutionRepo.findOne({
      where: [{ name: name }, { code: code }],
    });

    if (existingInstitution) {
      return NextResponse.json(
        {
          message:
            existingInstitution.name === name
              ? "Institution with this name already exists"
              : "Institution with this code already exists",
        },
        { status: 400 }
      );
    }

    const newInstitution = institutionRepo.create({
      name,
      code,
      state,
      city,
      type,
      isActive: true,
    });

    await institutionRepo.save(newInstitution);

    return NextResponse.json(newInstitution, { status: 201 });
  } catch (error) {
    console.error("Error creating institution:", error);
    return NextResponse.json(
      { message: "Error creating institution" },
      { status: 500 }
    );
  }
}
