import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Forum } from "@/entities/Forum";

export const runtime = "nodejs";

// PUT /api/admin/forums/[id] - Update a forum
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !["admin", "super_admin"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, programId, isOpenToAll, isPinned, isActive, metadata } = body;

    const ds = await getDataSource();
    const forumRepo = ds.getRepository(Forum);

    const forum = await forumRepo.findOne({ where: { id } });
    if (!forum) {
      return NextResponse.json({ error: "Forum not found" }, { status: 404 });
    }

    if (name !== undefined) forum.name = name;
    if (description !== undefined) forum.description = description;
    if (programId !== undefined) forum.programId = programId || null;
    if (isOpenToAll !== undefined) forum.isOpenToAll = isOpenToAll;
    if (isPinned !== undefined) forum.isPinned = isPinned;
    if (isActive !== undefined) forum.isActive = isActive;
    if (metadata !== undefined) forum.metadata = metadata;

    const saved = await forumRepo.save(forum);
    return NextResponse.json({ success: true, forum: saved });
  } catch (error) {
    console.error("[PUT /api/admin/forums/[id]]", error);
    return NextResponse.json({ error: "Failed to update forum" }, { status: 500 });
  }
}

// DELETE /api/admin/forums/[id] - Delete a forum
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !["admin", "super_admin"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const ds = await getDataSource();
    const forumRepo = ds.getRepository(Forum);

    const forum = await forumRepo.findOne({ where: { id } });
    if (!forum) {
      return NextResponse.json({ error: "Forum not found" }, { status: 404 });
    }

    // Soft delete: just deactivate instead of removing
    await forumRepo.update(id, { isActive: false });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/forums/[id]]", error);
    return NextResponse.json({ error: "Failed to delete forum" }, { status: 500 });
  }
}
