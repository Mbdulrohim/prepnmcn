import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { CampusStory } from "@/entities/CampusStory";

export const runtime = "nodejs";

// GET /api/admin/website/stories - Get all campus stories
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
    const storyRepo = AppDataSource.getRepository(CampusStory);

    const stories = await storyRepo.find({
      order: { createdAt: "DESC" },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Error fetching campus stories:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/website/stories - Create a new campus story
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
    const { title, institution, content, imageUrl, author, isActive } = body;

    if (!title || !institution || !content || !author) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const storyRepo = AppDataSource.getRepository(CampusStory);

    const story = storyRepo.create({
      title,
      institution,
      content,
      imageUrl,
      author,
      isActive: isActive !== undefined ? isActive : true,
    });

    await storyRepo.save(story);

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error("Error creating campus story:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
