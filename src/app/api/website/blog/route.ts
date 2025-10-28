import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { BlogPost } from "@/entities/BlogPost";

export const runtime = "nodejs";

// GET /api/website/blog - Get published blog posts for public website
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const AppDataSource = await getDataSource();
    const blogRepo = AppDataSource.getRepository(BlogPost);

    const where: any = { isPublished: true };
    if (category) {
      where.category = category;
    }

    const posts = await blogRepo.find({
      where,
      order: { publishedAt: "DESC", createdAt: "DESC" },
      select: ["id", "title", "excerpt", "author", "category", "tags", "imageUrl", "publishedAt", "createdAt"],
      take: Math.min(limit, 50), // Max 50 posts per request
      skip: offset,
    });

    // Get total count for pagination
    const total = await blogRepo.count({ where });

    return NextResponse.json({
      posts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}