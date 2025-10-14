import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AppDataSource } from "../../../lib/database";
import { Feedback } from "../../../entities/Feedback";
import { NotificationAutomation } from "../../../lib/notification-automation";

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

  // Trigger automation for feedback submission
  try {
    await NotificationAutomation.triggerAutomation("feedback_submitted", {
      userId: parseInt(userId),
      feedbackId: feedback.id,
      message: feedback.message,
      submittedAt: feedback.createdAt,
    });
  } catch (error) {
    console.error("Failed to trigger feedback submission automation:", error);
    // Don't fail the feedback submission if automation fails
  }

  return NextResponse.json({ message: "Feedback submitted successfully" });
}
