import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Forum } from "@/entities/Forum";
import { ForumPost } from "@/entities/ForumPost";
import { ForumMember } from "@/entities/ForumMember";

export const runtime = "nodejs";

const PAGE_SIZE = 50;

// GET /api/forums/[slug]/posts?before=<iso>&limit=50
// Returns posts in the forum, newest last (chronological), supports cursor pagination
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const userId = (session.user as any).id as string;

    const ds = await getDataSource();
    const forumRepo = ds.getRepository(Forum);
    const postRepo = ds.getRepository(ForumPost);
    const memberRepo = ds.getRepository(ForumMember);

    const forum = await forumRepo.findOne({ where: { slug, isActive: true } });
    if (!forum) {
      return NextResponse.json({ error: "Forum not found" }, { status: 404 });
    }

    const isMember = await memberRepo.findOne({ where: { forumId: forum.id, userId } });
    const isAdmin = ["admin", "super_admin"].includes((session.user as any).role);

    if (!isMember && !isAdmin) {
      return NextResponse.json({ error: "You must join the forum first" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const after = searchParams.get("after"); // ISO timestamp for polling (get newer than)
    const before = searchParams.get("before"); // ISO timestamp for infinite scroll (get older than)
    const limit = Math.min(parseInt(searchParams.get("limit") ?? String(PAGE_SIZE)), 100);

    let qb = postRepo
      .createQueryBuilder("p")
      .leftJoin("p.user", "u")
      .addSelect(["u.id", "u.name", "u.email"])
      .where("p.forumId = :forumId", { forumId: forum.id })
      .andWhere("p.isDeleted = false");

    if (after) {
      qb = qb.andWhere("p.createdAt > :after", { after: new Date(after) });
      qb = qb.orderBy("p.createdAt", "ASC").limit(limit);
    } else if (before) {
      qb = qb.andWhere("p.createdAt < :before", { before: new Date(before) });
      qb = qb.orderBy("p.createdAt", "DESC").limit(limit);
    } else {
      // Initial load: last N messages
      qb = qb.orderBy("p.createdAt", "DESC").limit(limit);
    }

    const rawPosts = await qb.getMany();

    // For DESC queries we need to reverse so messages appear in chronological order
    const posts = (before || (!after && !before)) ? rawPosts.reverse() : rawPosts;

    const formatted = posts.map((p) => ({
      id: p.id,
      content: p.content,
      isPinned: p.isPinned,
      parentPostId: p.parentPostId,
      metadata: p.metadata,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      user: {
        id: (p.user as any)?.id,
        name: (p.user as any)?.name,
        email: (p.user as any)?.email,
      },
    }));

    return NextResponse.json({ success: true, posts, hasMore: rawPosts.length === limit });
  } catch (error) {
    console.error("[GET /api/forums/[slug]/posts]", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST /api/forums/[slug]/posts - Send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const userId = (session.user as any).id as string;

    const ds = await getDataSource();
    const forumRepo = ds.getRepository(Forum);
    const postRepo = ds.getRepository(ForumPost);
    const memberRepo = ds.getRepository(ForumMember);

    const forum = await forumRepo.findOne({ where: { slug, isActive: true } });
    if (!forum) {
      return NextResponse.json({ error: "Forum not found" }, { status: 404 });
    }

    const isAdmin = ["admin", "super_admin"].includes((session.user as any).role);
    const isMember = await memberRepo.findOne({ where: { forumId: forum.id, userId } });

    if (!isMember && !isAdmin) {
      return NextResponse.json({ error: "You must join the forum first" }, { status: 403 });
    }

    const body = await req.json();
    const content: string = (body.content ?? "").trim();
    const parentPostId: string | undefined = body.parentPostId ?? undefined;

    if (!content || content.length > 5000) {
      return NextResponse.json({ error: "Content must be 1–5000 characters" }, { status: 400 });
    }

    const post = postRepo.create({ forumId: forum.id, userId, content, parentPostId });
    const saved = await postRepo.save(post);

    // Re-fetch with user relation for the response
    const withUser = await postRepo.findOne({
      where: { id: saved.id },
      relations: ["user"],
    });

    return NextResponse.json({
      success: true,
      post: {
        id: withUser!.id,
        content: withUser!.content,
        isPinned: withUser!.isPinned,
        parentPostId: withUser!.parentPostId,
        createdAt: withUser!.createdAt,
        updatedAt: withUser!.updatedAt,
        user: {
          id: withUser!.user.id,
          name: withUser!.user.name,
          email: withUser!.user.email,
        },
      },
    });
  } catch (error) {
    console.error("[POST /api/forums/[slug]/posts]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
