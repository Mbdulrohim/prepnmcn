import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { CommunityVoice } from "@/entities/CommunityVoice";

export const runtime = "nodejs";

// GET /api/website/voices - Get active community voices for public website
export async function GET() {
  try {
    const AppDataSource = await getDataSource();
    const voiceRepo = AppDataSource.getRepository(CommunityVoice);

    const voices = await voiceRepo.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
      select: ["id", "name", "role", "institution", "content", "imageUrl", "createdAt"],
    });

    return NextResponse.json(voices);
  } catch (error) {
    console.error("Error fetching community voices:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}