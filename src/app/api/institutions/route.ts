import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Institution } from "@/entities/Institution";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : null; // null = no limit
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get database connection
    const AppDataSource = await getDataSource();
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

    // Apply ordering
    query = query.orderBy("institution.name", "ASC");

    // Apply pagination only if limit is specified
    if (limit !== null) {
      query = query.limit(limit).offset(offset);
    }

    const [institutions, total] = await query.getManyAndCount();

    console.log(
      `Returning ${institutions.length} out of ${total} total institutions`
    );

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
        limit: limit || total,
        offset,
        hasMore: limit !== null ? offset + limit < total : false,
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
