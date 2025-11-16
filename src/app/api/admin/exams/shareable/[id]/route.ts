import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Exam } from "@/entities/Exam";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dataSource = await getDataSource();
    const examRepo = dataSource.getRepository(Exam);

    const exam = await examRepo.findOne({
      where: { id, isShareable: true },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Shareable exam not found" },
        { status: 404 }
      );
    }

    await examRepo.remove(exam);

    return NextResponse.json({
      success: true,
      message: "Shareable exam deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting shareable exam:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete shareable exam" },
      { status: 500 }
    );
  }
}
