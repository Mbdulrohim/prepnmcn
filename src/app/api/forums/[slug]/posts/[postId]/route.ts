import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { ForumPost } from "@/entities/ForumPost";
import { Forum } from "@/entities/Forum";

export const runtime = "nodejs";

// DELETE /api/forums/[slug]/posts/[postId] - Soft-delete a post (author or admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, postId } = await params;
    const userId = (session.user as any).id as string;
    const isAdmin = ["admin", "super_admin"].includes(
      (session.user as any).role,
    );

    const ds = await getDataSource();
    const forumRepo = ds.getRepository(Forum);
    const postRepo = ds.getRepository(ForumPost);

    const forum = await forumRepo.findOne({ where: { slug } });
    if (!forum) {
      return NextResponse.json({ error: "Forum not found" }, { status: 404 });
    }

    const post = await postRepo.findOne({
      where: { id: postId, forumId: forum.id },
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await postRepo.update(post.id, { isDeleted: true, content: "[deleted]" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/forums/[slug]/posts/[postId]]", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 },
    );
  }
}
