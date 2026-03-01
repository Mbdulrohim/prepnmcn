import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Forum } from "@/entities/Forum";
import { ForumMember } from "@/entities/ForumMember";
import { UserProgramEnrollment, EnrollmentStatus } from "@/entities/UserProgramEnrollment";

export const runtime = "nodejs";

// GET /api/forums - List forums accessible to the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const isAdmin = ["admin", "super_admin"].includes((session.user as any).role);

    const ds = await getDataSource();
    const forumRepo = ds.getRepository(Forum);
    const enrollmentRepo = ds.getRepository(UserProgramEnrollment);
    const memberRepo = ds.getRepository(ForumMember);

    // Get the user's active program enrollments
    const activeEnrollments = await enrollmentRepo.find({
      where: { userId, status: EnrollmentStatus.ACTIVE },
      select: ["programId"],
    });
    const activeProgramIds = activeEnrollments.map((e) => e.programId as string);

    // Fetch all active forums
    const allForums = await forumRepo.find({
      where: { isActive: true },
      order: { isPinned: "DESC", createdAt: "ASC" },
    });

    // Filter by access rules (admins see all)
    const accessibleForums = isAdmin
      ? allForums
      : allForums.filter((f) => {
          if (f.isOpenToAll) return true;
          if (f.programId) return activeProgramIds.includes(f.programId);
          // No programId + not isOpenToAll = any enrolled user
          return activeProgramIds.length > 0;
        });

    // Get membership status for each forum
    const memberships = await memberRepo.find({
      where: { userId },
      select: ["forumId"],
    });
    const joinedForumIds = new Set(memberships.map((m) => m.forumId));

    // Get member count per forum
    const memberCounts = await memberRepo
      .createQueryBuilder("fm")
      .select("fm.forumId", "forumId")
      .addSelect("COUNT(*)", "count")
      .where("fm.forumId IN (:...ids)", {
        ids: accessibleForums.length > 0 ? accessibleForums.map((f) => f.id) : ["none"],
      })
      .groupBy("fm.forumId")
      .getRawMany();

    const memberCountMap = new Map(memberCounts.map((r) => [r.forumId, parseInt(r.count)]));

    const forums = accessibleForums.map((f) => ({
      id: f.id,
      slug: f.slug,
      name: f.name,
      description: f.description,
      programId: f.programId,
      isOpenToAll: f.isOpenToAll,
      isPinned: f.isPinned,
      metadata: f.metadata,
      isMember: joinedForumIds.has(f.id),
      memberCount: memberCountMap.get(f.id) ?? 0,
      createdAt: f.createdAt,
    }));

    return NextResponse.json({ success: true, forums });
  } catch (error) {
    console.error("[GET /api/forums]", error);
    return NextResponse.json({ error: "Failed to fetch forums" }, { status: 500 });
  }
}
