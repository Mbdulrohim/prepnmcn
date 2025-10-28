import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { CommunityVoice } from "@/entities/CommunityVoice";

export const runtime = "nodejs";

// GET /api/admin/website/voices - Get all community voices
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
    const voiceRepo = AppDataSource.getRepository(CommunityVoice);

    const voices = await voiceRepo.find({
      order: { createdAt: "DESC" },
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

// POST /api/admin/website/voices - Create a new community voice
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, role, institution, content, imageUrl, isActive } = body;

    if (!name || !role || !institution || !content) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const voiceRepo = AppDataSource.getRepository(CommunityVoice);

    const voice = voiceRepo.create({
      name,
      role,
      institution,
      content,
      imageUrl,
      isActive: isActive !== undefined ? isActive : true,
    });

    await voiceRepo.save(voice);

    return NextResponse.json(voice, { status: 201 });
  } catch (error) {
    console.error("Error creating community voice:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}