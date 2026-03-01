import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Forum } from "@/entities/Forum";
import { ForumMember } from "@/entities/ForumMember";
import { UserProgramEnrollment, EnrollmentStatus } from "@/entities/UserProgramEnrollment";

export const runtime = "nodejs";

// GET /api/forums/[slug] - Get forum details + access check
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
    const isAdmin = ["admin", "super_admin"].includes((session.user as any).role);

    const ds = await getDataSource();
    const forumRepo = ds.getRepository(Forum);
    const enrollmentRepo = ds.getRepository(UserProgramEnrollment);
    const memberRepo = ds.getRepository(ForumMember);

    const forum = await forumRepo.findOne({ where: { slug, isActive: true } });
    if (!forum) {
      return NextResponse.json({ error: "Forum not found" }, { status: 404 });
    }

    // Check access
    if (!isAdmin) {
      const activeEnrollments = await enrollmentRepo.find({
        where: { userId, status: EnrollmentStatus.ACTIVE },
        select: ["programId"],
      });
      const activeProgramIds = activeEnrollments.map((e) => e.programId as string);

      const hasAccess =
        forum.isOpenToAll ||
        (forum.programId && activeProgramIds.includes(forum.programId)) ||
        (!forum.programId && !forum.isOpenToAll && activeProgramIds.length > 0);

      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const membership = await memberRepo.findOne({ where: { forumId: forum.id, userId } });
    const memberCount = await memberRepo.count({ where: { forumId: forum.id } });

    return NextResponse.json({
      success: true,
      forum: {
        id: forum.id,
        slug: forum.slug,
        name: forum.name,
        description: forum.description,
        programId: forum.programId,
        isOpenToAll: forum.isOpenToAll,
        isPinned: forum.isPinned,
        metadata: forum.metadata,
        memberCount,
        isMember: !!membership,
        createdAt: forum.createdAt,
      },
    });
  } catch (error) {
    console.error("[GET /api/forums/[slug]]", error);
    return NextResponse.json({ error: "Failed to fetch forum" }, { status: 500 });
  }
}
