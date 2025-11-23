import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Resource } from "@/entities/Resource";
import { auth } from "@/lib/auth";
import { User } from "@/entities/User";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Check if user is premium
  const AppDataSource = await getDataSource();
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: session.user.id } });
  
  if (!user?.isPremium) {
    return NextResponse.json(
      { error: "Premium subscription required to access resources" },
      { status: 403 }
    );
  }

  // Check if premium has expired
  if (user.premiumExpiresAt && new Date() > new Date(user.premiumExpiresAt)) {
    return NextResponse.json(
      { error: "Premium subscription has expired" },
      { status: 403 }
    );
  }
  try {
    const resourceRepo = AppDataSource.getRepository(Resource);

    // Support optional query params for filtering and search
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // free|paid
    const search = url.searchParams.get("search") || "";

    const qb = resourceRepo.createQueryBuilder("resource");

    if (type === "free") qb.where("resource.isFree = true");
    else if (type === "paid") qb.where("resource.isFree = false");

    if (search) {
      const like = `%${search}%`;
      if (type === "free" || type === "paid") {
        qb.andWhere(
          "(resource.name ILIKE :like OR resource.contentText ILIKE :like)",
          { like }
        );
      } else {
        qb.where(
          "(resource.name ILIKE :like OR resource.contentText ILIKE :like)",
          { like }
        );
      }
    }

    const resources = await qb
      .select([
        "resource.id",
        "resource.name",
        "resource.isFree",
        "resource.createdAt",
      ])
      .orderBy("resource.createdAt", "DESC")
      .getMany();
    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { message: "Error fetching resources" },
      { status: 500 }
    );
  }
}
