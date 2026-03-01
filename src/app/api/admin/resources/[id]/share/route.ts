import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Resource } from "@/entities/Resource";

export const runtime = "nodejs";

/**
 * POST /api/admin/resources/[id]/share — Enable sharing for a resource
 * Body: { shareSlug: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (
      !session?.user?.id ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { shareSlug } = body;

    if (!shareSlug || typeof shareSlug !== "string") {
      return NextResponse.json(
        { success: false, error: "Share slug is required" },
        { status: 400 },
      );
    }

    // Validate slug format (alphanumeric + hyphens)
    if (!/^[a-z0-9][a-z0-9-]{1,98}[a-z0-9]$/.test(shareSlug)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Slug must be 3-100 characters, lowercase alphanumeric and hyphens only",
        },
        { status: 400 },
      );
    }

    const dataSource = await getDataSource();
    const resourceRepo = dataSource.getRepository(Resource);

    // Check slug uniqueness
    const existing = await resourceRepo.findOne({ where: { shareSlug } });
    if (existing && existing.id !== parseInt(id)) {
      return NextResponse.json(
        { success: false, error: "This slug is already in use" },
        { status: 400 },
      );
    }

    const resource = await resourceRepo.findOne({
      where: { id: parseInt(id) },
    });
    if (!resource) {
      return NextResponse.json(
        { success: false, error: "Resource not found" },
        { status: 404 },
      );
    }

    resource.isShareable = true;
    resource.shareSlug = shareSlug;
    await resourceRepo.save(resource);

    return NextResponse.json({
      success: true,
      data: {
        id: resource.id,
        shareSlug: resource.shareSlug,
        isShareable: resource.isShareable,
        shareUrl: `/share/resource/${resource.shareSlug}`,
      },
    });
  } catch (error) {
    console.error("Error enabling resource sharing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to enable sharing" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/resources/[id]/share — Disable sharing for a resource
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (
      !session?.user?.id ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const dataSource = await getDataSource();
    const resourceRepo = dataSource.getRepository(Resource);

    const resource = await resourceRepo.findOne({
      where: { id: parseInt(id) },
    });
    if (!resource) {
      return NextResponse.json(
        { success: false, error: "Resource not found" },
        { status: 404 },
      );
    }

    resource.isShareable = false;
    resource.shareSlug = undefined;
    await resourceRepo.save(resource);

    return NextResponse.json({
      success: true,
      message: "Sharing disabled",
    });
  } catch (error) {
    console.error("Error disabling resource sharing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to disable sharing" },
      { status: 500 },
    );
  }
}
