import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";
import { performDailyCheckIn } from "@/lib/streak";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);

    // Get current user
    const user = await userRepository.findOne({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Perform daily check-in using utility function
    const result = await performDailyCheckIn(user.id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          data: result.data,
        },
        { status: result.error === "Already checked in today" ? 200 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error updating streak:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update streak" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: session.user.id },
      select: ["currentStreak", "longestStreak", "lastActivityDate"],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivityDate = user.lastActivityDate
      ? new Date(user.lastActivityDate)
      : null;

    if (lastActivityDate) {
      lastActivityDate.setHours(0, 0, 0, 0);
    }

    const hasCheckedInToday =
      lastActivityDate && lastActivityDate.getTime() === today.getTime();

    return NextResponse.json({
      success: true,
      data: {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        lastActivityDate: user.lastActivityDate,
        hasCheckedInToday,
      },
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch streak" },
      { status: 500 }
    );
  }
}
