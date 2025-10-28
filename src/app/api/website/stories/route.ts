import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { CampusStory } from "@/entities/CampusStory";

export const runtime = "nodejs";

// GET /api/website/stories - Get active campus stories for public website
export async function GET() {
  try {
    const AppDataSource = await getDataSource();
    const storyRepo = AppDataSource.getRepository(CampusStory);

    const stories = await storyRepo.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
      select: ["id", "title", "institution", "content", "imageUrl", "author", "createdAt"],
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