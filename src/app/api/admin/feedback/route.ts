import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Feedback } from "@/entities/Feedback";
import { User } from "@/entities/User";

export const runtime = "nodejs";

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
    const feedbackRepo = AppDataSource.getRepository(Feedback);
    const userRepo = AppDataSource.getRepository(User);

    const feedback = await feedbackRepo.find({
      relations: ["user"],
      order: { createdAt: "DESC" },
    });

    const formattedFeedback = await Promise.all(
      feedback.map(async (item) => {
        let userName = "Unknown User";
        let userEmail = "unknown@example.com";

        if (item.user) {
          userName = item.user.name;
          userEmail = item.user.email;
        } else {
          // Try to find user by userId if relation failed
          try {
            const user = await userRepo.findOne({
              where: { id: item.userId.toString() },
            });
            if (user) {
              userName = user.name;
              userEmail = user.email;
            }
          } catch (error) {
            console.error("Error finding user for feedback:", error);
          }
        }

        return {
          id: item.id,
          userId: item.userId,
          userName,
          userEmail,
          message: item.message,
          createdAt: item.createdAt,
          status: item.status || "unread",
        };
      })
    );

    // Calculate stats
    const stats = {
      totalFeedback: formattedFeedback.length,
      unreadFeedback: formattedFeedback.filter((f) => f.status === "unread")
        .length,
      readFeedback: formattedFeedback.filter((f) => f.status === "read").length,
      respondedFeedback: formattedFeedback.filter(
        (f) => f.status === "responded"
      ).length,
    };

    return NextResponse.json({
      feedback: formattedFeedback,
      stats,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { message: "Error fetching feedback" },
      { status: 500 }
    );
  }
}
