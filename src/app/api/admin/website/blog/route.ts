import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { BlogPost } from "@/entities/BlogPost";

export const runtime = "nodejs";

// GET /api/admin/website/blog - Get all blog posts
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
    const blogRepo = AppDataSource.getRepository(BlogPost);

    const posts = await blogRepo.find({
      order: { createdAt: "DESC" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/website/blog - Create a new blog post
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      author,
      category,
      tags,
      imageUrl,
      isPublished,
    } = body;

    if (!title || !content || !excerpt || !author || !category) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const blogRepo = AppDataSource.getRepository(BlogPost);

    const post = blogRepo.create({
      title,
      content,
      excerpt,
      author,
      category,
      tags: Array.isArray(tags) ? tags : [],
      imageUrl,
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : undefined,
    });

    await blogRepo.save(post);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
