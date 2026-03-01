import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Forum } from "@/entities/Forum";
import { ForumMember } from "@/entities/ForumMember";
import { ForumPost } from "@/entities/ForumPost";

export const runtime = "nodejs";

// GET /api/admin/forums - List all forums with stats
export async function GET() {
  try {
    const session = await auth();
    if (!session || !["admin", "super_admin"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ds = await getDataSource();
    const forumRepo = ds.getRepository(Forum);
    const memberRepo = ds.getRepository(ForumMember);
    const postRepo = ds.getRepository(ForumPost);

    const forums = await forumRepo.find({ order: { isPinned: "DESC", createdAt: "ASC" } });

    const forumIds = forums.length > 0 ? forums.map((f) => f.id) : ["none"];

    const memberCounts = await memberRepo
      .createQueryBuilder("fm")
      .select("fm.forumId", "forumId")
      .addSelect("COUNT(*)", "count")
      .where("fm.forumId IN (:...ids)", { ids: forumIds })
      .groupBy("fm.forumId")
      .getRawMany();

    const postCounts = await postRepo
      .createQueryBuilder("p")
      .select("p.forumId", "forumId")
      .addSelect("COUNT(*)", "count")
      .where("p.forumId IN (:...ids)", { ids: forumIds })
      .andWhere("p.isDeleted = false")
      .groupBy("p.forumId")
      .getRawMany();

    const memberCountMap = new Map(memberCounts.map((r) => [r.forumId, parseInt(r.count)]));
    const postCountMap = new Map(postCounts.map((r) => [r.forumId, parseInt(r.count)]));

    const result = forums.map((f) => ({
      id: f.id,
      slug: f.slug,
      name: f.name,
      description: f.description,
      programId: f.programId,
      isOpenToAll: f.isOpenToAll,
      isActive: f.isActive,
      isPinned: f.isPinned,
      metadata: f.metadata,
      memberCount: memberCountMap.get(f.id) ?? 0,
      postCount: postCountMap.get(f.id) ?? 0,
      createdAt: f.createdAt,
    }));

    return NextResponse.json({ success: true, forums: result });
  } catch (error) {
    console.error("[GET /api/admin/forums]", error);
    return NextResponse.json({ error: "Failed to fetch forums" }, { status: 500 });
  }
}

// POST /api/admin/forums - Create a new forum
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "super_admin"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, description, programId, isOpenToAll, isPinned, metadata } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
    }

    // Sanitize slug
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const ds = await getDataSource();
    const forumRepo = ds.getRepository(Forum);

    const exists = await forumRepo.findOne({ where: { slug: cleanSlug } });
    if (exists) {
      return NextResponse.json({ error: "A forum with this slug already exists" }, { status: 409 });
    }

    const userId = (session.user as any).id as string;
    const forum = forumRepo.create({
      name,
      slug: cleanSlug,
      description,
      programId: programId || null,
      isOpenToAll: isOpenToAll ?? false,
      isPinned: isPinned ?? false,
      isActive: true,
      createdByUserId: userId,
      metadata,
    });

    const saved = await forumRepo.save(forum);
    return NextResponse.json({ success: true, forum: saved }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/forums]", error);
    return NextResponse.json({ error: "Failed to create forum" }, { status: 500 });
  }
}
