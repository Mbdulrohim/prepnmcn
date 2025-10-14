import { NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { getDataSource } from "../../../../../lib/database";
import { User } from "../../../../../entities/User";
import { PDFDocument, rgb } from "pdf-lib";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET() {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);

    // Get all users with institution data, sorted alphabetically by name
    const users = await userRepo.find({
      relations: ["institution"],
      order: { name: "ASC" },
    });

    console.log(`Found ${users.length} users for export`);

    if (users.length === 0) {
      return NextResponse.json(
        { message: "No users found to export" },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateStudentBiosPDF(users);

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="student-bios-${
          new Date().toISOString().split("T")[0]
        }.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating student bios PDF:", error);
    return NextResponse.json(
      { message: "Error generating student bios PDF" },
      { status: 500 }
    );
  }
}

function generateStudentBiosPDF(users: User[]): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();

      // Set up fonts and colors
      const fontSize = 12;
      let yPosition = height - 50;

      // Title
      page.drawText("Student Bios Report", {
        x: 50,
        y: yPosition,
        size: 20,
        color: rgb(0, 0, 0),
      });
      yPosition -= 40;

      // Generation date
      page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0.5, 0.5, 0.5),
      });
      yPosition -= 30;

      // Total count
      page.drawText(`Total Students: ${users.length}`, {
        x: 50,
        y: yPosition,
        size: 14,
        color: rgb(0, 0, 0),
      });
      yPosition -= 50;

      // Table headers
      const headers = ["Name", "Email", "Institution"];
      const columnWidths = [150, 200, 150];
      let xPosition = 50;

      headers.forEach((header, index) => {
        page.drawText(header, {
          x: xPosition,
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        xPosition += columnWidths[index];
      });

      yPosition -= 20;

      // Draw header line
      page.drawLine({
        start: { x: 50, y: yPosition + 15 },
        end: {
          x: 50 + columnWidths.reduce((a, b) => a + b, 0),
          y: yPosition + 15,
        },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      // Table content
      users.forEach((user) => {
        // Check if we need a new page
        if (yPosition < 50) {
          const newPage = pdfDoc.addPage();
          yPosition = height - 50;

          // Re-add headers on new page
          xPosition = 50;
          headers.forEach((header, index) => {
            newPage.drawText(header, {
              x: xPosition,
              y: yPosition,
              size: fontSize,
              color: rgb(0, 0, 0),
            });
            xPosition += columnWidths[index];
          });
          yPosition -= 20;
          newPage.drawLine({
            start: { x: 50, y: yPosition + 15 },
            end: {
              x: 50 + columnWidths.reduce((a, b) => a + b, 0),
              y: yPosition + 15,
            },
            thickness: 1,
            color: rgb(0, 0, 0),
          });
        }

        xPosition = 50;
        const name = user.name || "N/A";
        const email = user.email || "N/A";
        const institution = user.institution ? user.institution.name : "N/A";

        // Name
        page.drawText(name, {
          x: xPosition,
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        xPosition += columnWidths[0];

        // Email
        page.drawText(email, {
          x: xPosition,
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        xPosition += columnWidths[1];

        // Institution
        page.drawText(institution, {
          x: xPosition,
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0),
        });

        yPosition -= 20;
      });

      // Serialize the PDF
      const pdfBytes = await pdfDoc.save();
      resolve(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error in PDF generation function:", error);
      reject(error);
    }
  });
}
