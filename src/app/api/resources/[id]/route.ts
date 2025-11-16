import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Resource } from "@/entities/Resource";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

      return NextResponse.json({ downloadUrl: resource.fileUrl });
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
