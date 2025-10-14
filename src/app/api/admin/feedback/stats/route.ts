import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Feedback } from "@/entities/Feedback";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const AppDataSource = await getDataSource();
    const feedbackRepo = AppDataSource.getRepository(Feedback);

    const unreadCount = await feedbackRepo.count({
      where: { status: "unread" },
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    return NextResponse.json(
      { message: "Error fetching feedback stats" },
      { status: 500 }
    );
  }
}
