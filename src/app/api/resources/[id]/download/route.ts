import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Resource } from "@/entities/Resource";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { auth } from "@/lib/auth";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const resourceId = parseInt(id, 10);

    const AppDataSource = await getDataSource();
    const resourceRepo = AppDataSource.getRepository(Resource);
    const resource = await resourceRepo.findOne({ where: { id: resourceId } });

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );
    }

    if (!resource.isFree && (session?.user as any)?.role !== "admin") {
      return NextResponse.json(
        { message: "This is a paid resource" },
        { status: 403 }
      );
    }

    // If the resource has a fileUrl, it's an S3 key - generate a fresh pre-signed URL
    if (resource.fileUrl) {
      try {
        // Extract S3 key from URL if it's a full URL, or use as-is if it's just a key
        let s3Key = resource.fileUrl;
        if (resource.fileUrl.includes('amazonaws.com')) {
          // Extract key from full S3 URL
          const urlParts = new URL(resource.fileUrl);
          s3Key = urlParts.pathname.substring(1); // Remove leading slash
        }

        // Generate a fresh pre-signed URL (valid for 1 hour)
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
        });

        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600, // 1 hour
        });

        return NextResponse.redirect(signedUrl);
      } catch (s3Error) {
        console.error("Error generating pre-signed URL:", s3Error);
        return NextResponse.json(
          { message: "Error accessing file. Please try again." },
          { status: 500 }
        );
      }
    }

    // Generate PDF from content
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    // Add header
    page.drawText("Downloaded from Prepp", {
      x: 50,
      y: height - 50,
      font,
      size: 16,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Add content if available
    if (resource.contentText && resource.contentText.trim()) {
      page.drawText(resource.contentText, {
        x: 50,
        y: height - 100,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
        maxWidth: width - 100,
        lineHeight: 14,
      });
    } else {
      page.drawText("No content available", {
        x: 50,
        y: height - 100,
        font,
        size: fontSize,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    // Add footer
    page.drawText(`Page 1 of 1`, {
      x: 50,
      y: 50,
      font,
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${resource.name}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { message: "Error generating PDF" },
      { status: 500 }
    );
  }
}
