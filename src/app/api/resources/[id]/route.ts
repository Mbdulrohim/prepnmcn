import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Resource } from "@/entities/Resource";
import { auth } from "@/lib/auth";
import { User } from "@/entities/User";
import { getUserActiveEnrollments } from "@/lib/enrollmentHelpers";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const resourceId = parseInt(id);
  if (isNaN(resourceId)) {
    return NextResponse.json(
      { message: "Invalid resource ID" },
      { status: 400 }
    );
  }

  try {
    const AppDataSource = await getDataSource();
    const resourceRepo = AppDataSource.getRepository(Resource);
    const userRepo = AppDataSource.getRepository(User);

    const resource = await resourceRepo.findOne({ where: { id: resourceId } });
    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );
    }

    const userRole = (session.user as any)?.role;
    const isAdmin = userRole === "admin" || userRole === "super_admin";

    if (resource.isHidden && !isAdmin) {
      return NextResponse.json(
        { message: "Resource not available" },
        { status: 404 }
      );
    }

    if (!isAdmin) {
      const activeEnrollments = await getUserActiveEnrollments(session.user.id);
      const enrolledProgramIds = activeEnrollments.map((e) => e.programId);

      const user = await userRepo.findOne({ where: { id: session.user.id } });
      const hasLegacyPremium =
        user?.isPremium &&
        (!user.premiumExpiresAt || new Date() <= new Date(user.premiumExpiresAt));

      if (activeEnrollments.length === 0 && !hasLegacyPremium) {
        return NextResponse.json(
          { message: "Active program enrollment required to access resources" },
          { status: 403 }
        );
      }

      const hasAccess =
        enrolledProgramIds.length > 0
          ? resource.isFree ||
            resource.isGlobal ||
            !resource.programId ||
            enrolledProgramIds.includes(resource.programId)
          : resource.isFree || !resource.programId;

      if (!hasAccess) {
        return NextResponse.json(
          { message: "You do not have access to this resource" },
          { status: 403 }
        );
      }
    }

    const url = new URL(request.url);
    const isDownload = url.searchParams.get("download") === "true";

    // Only allow public download for free resources
    if (isDownload) {
      if (!resource.isFree) {
        return NextResponse.json(
          { message: "Resource requires purchase" },
          { status: 403 }
        );
      }
      if (!resource.fileUrl) {
        return NextResponse.json(
          { message: "File not available" },
          { status: 404 }
        );
      }

      return NextResponse.json({ downloadUrl: `/api/resources/${resource.id}/download` });
    }

    // return resource metadata
    const { id: rid, name, isFree, createdAt } = resource;
    return NextResponse.json({ id: rid, name, isFree, createdAt });
  } catch (error) {
    console.error("Error getting resource:", error);
    return NextResponse.json(
      { message: "Failed to load resource" },
      { status: 500 }
    );
  }
}
