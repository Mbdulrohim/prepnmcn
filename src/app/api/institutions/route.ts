import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/database";
import { Institution } from "@/entities/Institution";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Initialize database if not already
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const institutionRepo = AppDataSource.getRepository(Institution);

    let query = institutionRepo
      .createQueryBuilder("institution")
      .where("institution.isActive = :isActive", { isActive: true });

    if (search) {
      query = query.andWhere(
        "(LOWER(institution.name) LIKE LOWER(:search) OR LOWER(institution.code) LIKE LOWER(:search))",
        { search: `%${search}%` }
      );
    }

    const [institutions, total] = await query
      .orderBy("institution.name", "ASC")
      .limit(limit)
      .offset(offset)
      .getManyAndCount();

    return NextResponse.json({
      success: true,
      institutions: institutions.map((inst: Institution) => ({
        id: inst.id,
        name: inst.name,
        code: inst.code,
        state: inst.state,
        city: inst.city,
        type: inst.type,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json(
      { error: "Failed to fetch institutions" },
      { status: 500 }
    );
  }
}
