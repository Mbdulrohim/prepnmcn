import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { ExamAttempt } from "@/entities/ExamAttempt";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");

    const ds = await getDataSource();
    const repo = ds.getRepository(ExamAttempt);

    const where: any = { userId: session.user.id };
    if (examId) where.examId = examId;

    const attempts = await repo.find({ where, order: { createdAt: "DESC" } });

    return NextResponse.json({ success: true, data: attempts });
  } catch (error) {
    console.error("Error listing attempts:", error);
    return NextResponse.json({ success: false, error: "Failed to list attempts" }, { status: 500 });
  }
}
