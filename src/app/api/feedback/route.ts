import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Feedback } from "@/entities/Feedback";

export const runtime = "nodejs"; // Force Node.js runtime

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const feedbackRepo = AppDataSource.getRepository(Feedback);
    const feedback = feedbackRepo.create({ userId: session.user.id, message });
    await feedbackRepo.save(feedback);

    // Trigger automation asynchronously to avoid blocking the response
    setImmediate(() => {
      import("@/lib/notification-automation")
        .then(({ NotificationAutomation }) => {
          NotificationAutomation.triggerAutomation(
            AppDataSource, // Pass the initialized DataSource
            "feedback_submitted",
            {
              userId: session.user!.id,
              feedbackId: feedback.id,
              message: feedback.message,
              submittedAt: feedback.createdAt,
            }
          ).catch((error) => {
            console.error(
              "Failed to trigger feedback submission automation:",
              error
            );
          });
        })
        .catch((error) => {
          console.error("Failed to load notification automation module:", error);
        });
    });

    return NextResponse.json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
