import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AppDataSource } from "../../../lib/database";
import { Feedback } from "../../../entities/Feedback";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await request.json();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const feedbackRepo = AppDataSource.getRepository(Feedback);
  const feedback = feedbackRepo.create({ userId: parseInt(userId), message });
  await feedbackRepo.save(feedback);

  return NextResponse.json({ message: "Feedback submitted successfully" });
}
