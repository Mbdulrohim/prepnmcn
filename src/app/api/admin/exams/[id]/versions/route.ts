import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { ExamVersion } from "@/entities/ExamVersion";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(ExamVersion);

    const versions = await repo.find({
      where: { examId: id },
      order: { createdAt: "DESC" },
    });
    return NextResponse.json({ success: true, data: versions });
  } catch (error) {
    console.error("Error listing exam versions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list versions" },
      { status: 500 }
    );
  }
}
