import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { BlogPost } from "@/entities/BlogPost";

export const runtime = "nodejs";

// GET /api/website/blog/[id] - Get individual published blog post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const AppDataSource = await getDataSource();
    const blogRepo = AppDataSource.getRepository(BlogPost);

    const post = await blogRepo.findOne({
      where: { id, isPublished: true },
      select: ["id", "title", "content", "excerpt", "author", "category", "tags", "imageUrl", "publishedAt", "createdAt"],
    });

    if (!post) {
      return NextResponse.json(
        { message: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}