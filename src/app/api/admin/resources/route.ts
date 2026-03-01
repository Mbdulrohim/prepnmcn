import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { getDataSource } from "../../../../lib/database";
import { Resource } from "../../../../entities/Resource";
import { Program } from "../../../../entities/Program";
import { uploadToS3 } from "../../../../lib/s3-upload";
import { getUserManagedPrograms } from "../../../../lib/programPermissions";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET(request: NextRequest) {
  const session = await auth();
  if (
    !session ||
    !["admin", "super_admin"].includes((session.user as any)?.role)
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const programId = searchParams.get("programId");

    // Validate limit (max 100 to prevent abuse)
    const validatedLimit = Math.min(Math.max(limit, 1), 100);

    const AppDataSource = await getDataSource();
    const resourceRepo = AppDataSource.getRepository(Resource);

    const qb = resourceRepo
      .createQueryBuilder("resource")
      .leftJoinAndSelect("resource.program", "program");

    // Filter by program if specified
    if (programId) {
      qb.where("resource.programId = :programId", { programId });
    }

    qb.orderBy("resource.createdAt", "DESC").take(validatedLimit).skip(offset);

    const [resources, totalCount] = await qb.getManyAndCount();

    return NextResponse.json({
      resources,
      totalCount,
      hasMore: offset + validatedLimit < totalCount,
      currentLimit: validatedLimit,
      currentOffset: offset,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { message: "Error fetching resources" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (
    !session ||
    !["admin", "super_admin"].includes((session.user as any)?.role)
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const name = formData.get("name") as string;
  const isFree = formData.get("isFree") === "true";
  const programId = formData.get("programId") as string | null;
  const isGlobal = formData.get("isGlobal") === "true";

  if (!file || !name) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );
  }

  // Validate file type
  if (!file.type || !file.type.includes("pdf")) {
    return NextResponse.json(
      { message: "Only PDF files are allowed" },
      { status: 400 },
    );
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { message: "File size must be less than 10MB" },
      { status: 400 },
    );
  }

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Parse PDF with better error handling
    let contentText = "";
    try {
      // Use require for pdf-parse (CommonJS module)
      const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<any>;
      const pdfData = await pdfParse(fileBuffer);
      contentText = pdfData.text || "";
    } catch (pdfError) {
      console.warn(
        "PDF parsing failed, storing file without text extraction:",
        pdfError instanceof Error ? pdfError.message : String(pdfError),
      );
      // Continue with empty contentText - file will still be saved
      contentText = "";
    }

    // Upload file to S3
    const s3Key = `resources/${Date.now()}-${file.name}`;
    let fileUrl: string;
    try {
      fileUrl = await uploadToS3(fileBuffer, s3Key, file.type);
    } catch (s3Error) {
      console.error("S3 upload error:", s3Error);
      return NextResponse.json(
        { message: "Failed to upload file to storage" },
        { status: 500 },
      );
    }

    // Save to DB
    try {
      const AppDataSource = await getDataSource();
      const resourceRepo = AppDataSource.getRepository(Resource);
      // Resolve program if provided
      let program = null;
      if (programId && !isGlobal) {
        const programRepo = AppDataSource.getRepository(Program);
        program = await programRepo.findOne({ where: { id: programId } });
        if (!program) {
          return NextResponse.json(
            { message: "Invalid program selected" },
            { status: 400 },
          );
        }

        // Check program admin permission
        const userRole = (session.user as any)?.role;
        if (userRole !== "super_admin") {
          const managedPrograms = await getUserManagedPrograms(
            (session.user as any)?.id,
          );
          if (!managedPrograms.includes(programId)) {
            return NextResponse.json(
              {
                message:
                  "You don't have permission to add resources to this program",
              },
              { status: 403 },
            );
          }
        }
      }

      const newResource = resourceRepo.create({
        name,
        isFree,
        contentText,
        fileUrl,
        ...(program ? { program } : {}),
        ...(isGlobal ? { isGlobal: true } : {}),
      });
      await resourceRepo.save(newResource);

      return NextResponse.json(newResource, { status: 201 });
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Note: S3 file is already uploaded, we don't need to clean it up
      return NextResponse.json(
        { message: "Failed to save resource to database" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Unexpected error processing file upload:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred while processing the file" },
      { status: 500 },
    );
  }
}
