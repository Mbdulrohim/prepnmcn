import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Resource } from "@/entities/Resource";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET(request: Request) {
  try {
    const AppDataSource = await getDataSource();
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
