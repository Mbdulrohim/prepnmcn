import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { CommunityVoice } from "@/entities/CommunityVoice";

export const runtime = "nodejs";

// PUT /api/admin/website/voices/[id] - Update a community voice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    const voice = await voiceRepo.findOne({ where: { id } });
    if (!voice) {
      return NextResponse.json(
        { message: "Community voice not found" },
        { status: 404 }
      );
    }

    voice.name = name;
    voice.role = role;
    voice.institution = institution;
    voice.content = content;
    voice.imageUrl = imageUrl;
    voice.isActive = isActive !== undefined ? isActive : voice.isActive;

    await voiceRepo.save(voice);

    return NextResponse.json(voice);
  } catch (error) {
    console.error("Error updating community voice:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/website/voices/[id] - Delete a community voice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const AppDataSource = await getDataSource();
    const voiceRepo = AppDataSource.getRepository(CommunityVoice);

    const voice = await voiceRepo.findOne({ where: { id } });
    if (!voice) {
      return NextResponse.json(
        { message: "Community voice not found" },
        { status: 404 }
      );
    }

    await voiceRepo.remove(voice);

    return NextResponse.json({
      message: "Community voice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting community voice:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
