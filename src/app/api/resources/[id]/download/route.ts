import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Resource } from "@/entities/Resource";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { auth } from "@/lib/auth";

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

    // If the resource has a file URL, redirect to it
    if (resource.fileUrl) {
      return NextResponse.redirect(resource.fileUrl);
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
