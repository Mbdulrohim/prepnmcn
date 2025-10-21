import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";

export interface StreakUpdateResult {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakIncreased: boolean;
  streakReset: boolean;
}

export interface StreakCheckInResult {
  success: boolean;
  error?: string;
  data?: StreakUpdateResult;
}

/**
 * Performs a daily check-in for a user, updating their streak
 * @param userId - The ID of the user
 * @returns Promise<StreakCheckInResult>
 */
export async function performDailyCheckIn(
  userId: string
): Promise<StreakCheckInResult> {
  const dataSource = await getDataSource();
  const userRepository = dataSource.getRepository(User);

  // Get current user
  const user = await userRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    return {
      success: false,
      error: "User not found",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivityDate = user.lastActivityDate
    ? new Date(user.lastActivityDate)
    : null;

  if (lastActivityDate) {
    lastActivityDate.setHours(0, 0, 0, 0);
  }

  // Check if user already checked in today
  if (lastActivityDate && lastActivityDate.getTime() === today.getTime()) {
    return {
      success: false,
      error: "Already checked in today",
      data: {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        lastActivityDate: user.lastActivityDate!,
        streakIncreased: false,
        streakReset: false,
      },
    };
  }

  let newCurrentStreak = user.currentStreak;
  let newLongestStreak = user.longestStreak;
  let streakIncreased = false;
  let streakReset = false;

  if (!lastActivityDate) {
    // First activity ever
    newCurrentStreak = 1;
    streakIncreased = true;
  } else {
    const daysDifference = Math.floor(
      (today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference === 1) {
      // Consecutive day - increment streak
      newCurrentStreak = user.currentStreak + 1;
      streakIncreased = true;
    } else if (daysDifference === 0) {
      // Same day - no change
      newCurrentStreak = user.currentStreak;
    } else {
      // Streak broken - reset to 1
      newCurrentStreak = 1;
      streakReset = true;
    }
  }

  // Update longest streak if current is higher
  if (newCurrentStreak > user.longestStreak) {
    newLongestStreak = newCurrentStreak;
  }

  // Update user with new streak data
  await userRepository.update(userId, {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastActivityDate: today,
  });

  return {
    success: true,
    data: {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: today,
      streakIncreased,
      streakReset,
    },
  };
}

/**
 * Gets a user's current streak information
 * @param userId - The ID of the user
 * @returns Promise with streak data
 */
export async function getUserStreak(userId: string) {
  const dataSource = await getDataSource();
  const userRepository = dataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { id: userId },
    select: ["currentStreak", "longestStreak", "lastActivityDate"],
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastActivityDate: user.lastActivityDate,
  };
}

/**
 * Checks if a user's streak should be reset (if they haven't been active for more than 1 day)
 * @param userId - The ID of the user
 * @returns Promise<boolean> - true if streak should be reset
 */
export async function shouldResetStreak(userId: string): Promise<boolean> {
  const dataSource = await getDataSource();
  const userRepository = dataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { id: userId },
    select: ["lastActivityDate", "currentStreak"],
  });

  if (!user || !user.lastActivityDate || user.currentStreak === 0) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivityDate = new Date(user.lastActivityDate);
  lastActivityDate.setHours(0, 0, 0, 0);

  const daysDifference = Math.floor(
    (today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Reset streak if more than 1 day has passed
  return daysDifference > 1;
}
