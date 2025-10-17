import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { getDataSource } from "../../../../../lib/database";
import { Resource } from "../../../../../entities/Resource";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (
    !session ||
    !["admin", "super_admin"].includes((session.user as any)?.role)
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const resourceId = parseInt(id);
  if (isNaN(resourceId)) {
    return NextResponse.json(
      { message: "Invalid resource ID" },
      { status: 400 }
    );
  }

  // Check if this is a download request
  const { searchParams } = new URL(request.url);
  const isDownload = searchParams.get("download") === "true";

  try {
    const AppDataSource = await getDataSource();
    const resourceRepo = AppDataSource.getRepository(Resource);

    const resource = await resourceRepo.findOne({ where: { id: resourceId } });
    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );
    }

    // Check if resource has a file URL
    if (!resource.fileUrl) {
      return NextResponse.json(
        { message: "File not available" },
        { status: 404 }
      );
    }

    if (isDownload) {
      // Return the S3 URL directly for downloads
      return NextResponse.json({ downloadUrl: resource.fileUrl });
    }

    // For non-download requests, return resource data
    return NextResponse.json(resource);
  } catch (error) {
    console.error("Error serving resource:", error);
    return NextResponse.json(
      { message: "Failed to serve resource" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (
    !session ||
    !["admin", "super_admin"].includes((session.user as any)?.role)
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    const resource = await resourceRepo.findOne({ where: { id: resourceId } });
    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );
    }

    // Toggle the isFree status
    resource.isFree = !resource.isFree;
    await resourceRepo.save(resource);

    return NextResponse.json(resource, { status: 200 });
  } catch (error) {
    console.error("Error toggling resource type:", error);
    return NextResponse.json(
      { message: "Failed to update resource type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (
    !session ||
    !["admin", "super_admin"].includes((session.user as any)?.role)
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    const resource = await resourceRepo.findOne({ where: { id: resourceId } });
    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );
    }

    // Delete the resource from database
    await resourceRepo.delete(resourceId);

    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { message: "Failed to delete resource" },
      { status: 500 }
    );
  }
}
