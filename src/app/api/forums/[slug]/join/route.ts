import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Forum } from "@/entities/Forum";
import { ForumMember } from "@/entities/ForumMember";
import { UserProgramEnrollment, EnrollmentStatus } from "@/entities/UserProgramEnrollment";

export const runtime = "nodejs";

// Helper: verify access to a forum
async function verifyAccess(
  userId: string,
  forum: Forum,
  isAdmin: boolean,
  enrollmentRepo: any
): Promise<boolean> {
  if (isAdmin) return true;
  if (forum.isOpenToAll) return true;

  const activeEnrollments = await enrollmentRepo.find({
    where: { userId, status: EnrollmentStatus.ACTIVE },
    select: ["programId"],
  });
  const activeProgramIds = activeEnrollments.map((e: any) => e.programId as string);

  if (forum.programId) return activeProgramIds.includes(forum.programId);
  return activeProgramIds.length > 0;
}

// POST /api/forums/[slug]/join - Join a forum
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
    const isAdmin = ["admin", "super_admin"].includes((session.user as any).role);

    const ds = await getDataSource();
    const forumRepo = ds.getRepository(Forum);
    const enrollmentRepo = ds.getRepository(UserProgramEnrollment);
    const memberRepo = ds.getRepository(ForumMember);

    const forum = await forumRepo.findOne({ where: { slug, isActive: true } });
    if (!forum) {
      return NextResponse.json({ error: "Forum not found" }, { status: 404 });
    }

    const hasAccess = await verifyAccess(userId, forum, isAdmin, enrollmentRepo);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied. Enroll in the required program first." }, { status: 403 });
    }

    // Check if already a member
    const existing = await memberRepo.findOne({ where: { forumId: forum.id, userId } });
    if (existing) {
      return NextResponse.json({ success: true, message: "Already a member" });
    }

    const member = memberRepo.create({ forumId: forum.id, userId });
    await memberRepo.save(member);

    return NextResponse.json({ success: true, message: "Joined forum" });
  } catch (error) {
    console.error("[POST /api/forums/[slug]/join]", error);
    return NextResponse.json({ error: "Failed to join forum" }, { status: 500 });
  }
}

// DELETE /api/forums/[slug]/join - Leave a forum
export async function DELETE(
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
    const memberRepo = ds.getRepository(ForumMember);

    const forum = await forumRepo.findOne({ where: { slug } });
    if (!forum) {
      return NextResponse.json({ error: "Forum not found" }, { status: 404 });
    }

    await memberRepo.delete({ forumId: forum.id, userId });

    return NextResponse.json({ success: true, message: "Left forum" });
  } catch (error) {
    console.error("[DELETE /api/forums/[slug]/join]", error);
    return NextResponse.json({ error: "Failed to leave forum" }, { status: 500 });
  }
}
