import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { getDataSource } from "../../../../../lib/database";
import { Resource } from "../../../../../entities/Resource";
import { s3Client, BUCKET_NAME } from "../../../../../lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

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
  console.log("DELETE /api/admin/resources/[id] called");

  const session = await auth();
  if (
    !session ||
    !["admin", "super_admin"].includes((session.user as any)?.role)
  ) {
    console.log("Unauthorized: No session or invalid role");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const resourceId = parseInt(id);
  console.log("Deleting resource with ID:", resourceId);

  if (isNaN(resourceId)) {
    console.log("Invalid resource ID:", id);
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
      console.log("Resource not found:", resourceId);
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );
    }

    console.log(
      "Found resource:",
      resource.name,
      "File URL:",
      resource.fileUrl
    );

    // Extract S3 key from fileUrl
    let s3Key = "";
    if (resource.fileUrl) {
      if (resource.fileUrl.includes("amazonaws.com")) {
        // Extract key from full S3 URL
        const urlParts = new URL(resource.fileUrl);
        s3Key = urlParts.pathname.substring(1); // Remove leading slash
      } else {
        // Assume it's already just the key
        s3Key = resource.fileUrl;
      }

      console.log("Attempting to delete S3 object:", s3Key);

      // Delete file from S3
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
        });
        await s3Client.send(deleteCommand);
        console.log(`Successfully deleted S3 object: ${s3Key}`);
      } catch (s3Error) {
        console.error("Error deleting from S3:", s3Error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete the resource from database
    console.log("Attempting to delete from database, resource ID:", resourceId);
    const deleteResult = await resourceRepo.delete(resourceId);
    console.log("Database deletion result:", deleteResult);

    return NextResponse.json({
      message: "Resource deleted successfully",
      deletedFromS3: !!s3Key,
      deletedFromDB: deleteResult.affected && deleteResult.affected > 0,
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { message: "Failed to delete resource", error: String(error) },
      { status: 500 }
    );
  }
}
