import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { getDataSource } from "../../../../../lib/database";
import { Resource } from "../../../../../entities/Resource";
import { promises as fs } from "fs";
import path from "path";

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

    // Check if file exists
    try {
      await fs.access(resource.originalFilePath);
    } catch (fileError) {
      return NextResponse.json(
        { message: "File not found on disk" },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await fs.readFile(resource.originalFilePath);

    // Set content disposition based on request type
    const contentDisposition = isDownload
      ? `attachment; filename="${resource.name}.pdf"`
      : `inline; filename="${resource.name}.pdf"`;

    // Return the file with proper headers
    const response = new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
        "Content-Length": fileBuffer.length.toString(),
      },
    });

    return response;
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
