import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Resource } from "@/entities/Resource";
import { User } from "@/entities/User";
import { getUserActiveEnrollments } from "@/lib/enrollmentHelpers";

export const runtime = "nodejs";

/**
 * GET /api/resources/share/[slug] — Fetch a shared resource by its slug
 * Requires authentication. Returns resource metadata (not the file itself).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please sign in to view this resource" },
        { status: 401 },
      );
    }

    const dataSource = await getDataSource();
    const resourceRepo = dataSource.getRepository(Resource);

    const resource = await resourceRepo.findOne({
      where: { shareSlug: slug, isShareable: true },
      relations: ["program"],
    });

    if (!resource || resource.isHidden) {
      return NextResponse.json(
        { success: false, error: "Resource not found or sharing is disabled" },
        { status: 404 },
      );
    }

    const userRole = (session.user as any)?.role;
    const isAdmin = userRole === "admin" || userRole === "super_admin";

    if (!isAdmin) {
      const dataSource2 = await getDataSource();
      const userRepo = dataSource2.getRepository(User);
      const activeEnrollments = await getUserActiveEnrollments(session.user.id);
      const enrolledProgramIds = activeEnrollments.map((e) => e.programId);

      const user = await userRepo.findOne({ where: { id: session.user.id } });
      const hasLegacyPremium =
        user?.isPremium &&
        (!user.premiumExpiresAt ||
          new Date() <= new Date(user.premiumExpiresAt));

      if (activeEnrollments.length === 0 && !hasLegacyPremium) {
        return NextResponse.json(
          {
            success: false,
            error: "Active program enrollment required to access resources",
          },
          { status: 403 },
        );
      }

      const hasAccess =
        enrolledProgramIds.length > 0
          ? resource.isGlobal ||
            !resource.programId ||
            enrolledProgramIds.includes(resource.programId)
          : !resource.programId;

      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: "You do not have access to this resource" },
          { status: 403 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: resource.id,
        name: resource.name,
        isFree: resource.isFree,
        isShareable: resource.isShareable,
        shareSlug: resource.shareSlug,
        programName: resource.program?.name || null,
        programCode: (resource.program as any)?.code || null,
        createdAt: resource.createdAt,
        downloadUrl: `/api/resources/${resource.id}/download`,
      },
    });
  } catch (error) {
    console.error("Error fetching shared resource:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load resource" },
      { status: 500 },
    );
  }
}
