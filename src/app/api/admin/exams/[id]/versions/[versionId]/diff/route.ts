import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { ExamVersion } from "@/entities/ExamVersion";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { versionId } = await params;
    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(ExamVersion);

    const version = await repo.findOne({ where: { id: versionId } });
    if (!version) {
      return NextResponse.json(
        { success: false, error: "Version not found" },
        { status: 404 }
      );
    }

    // Return the snapshot for now; diffing will be handled client-side
    return NextResponse.json({ success: true, data: version });
  } catch (error) {
    console.error("Error returning diff:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch diff" },
      { status: 500 }
    );
  }
}
