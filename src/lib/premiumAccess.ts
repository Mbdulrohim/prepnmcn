import { DataSource } from "typeorm";
import { User } from "@/entities/User";
import {
  EnrollmentStatus,
  UserProgramEnrollment,
} from "@/entities/UserProgramEnrollment";

export function calculatePremiumExpiry({
  durationDays = 30,
  durationMonths,
}: {
  durationDays?: number;
  durationMonths?: number;
}) {
  const expiresAt = new Date();

  if (durationMonths) {
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);
  } else {
    expiresAt.setDate(expiresAt.getDate() + durationDays);
  }

  return expiresAt;
}

export async function syncLegacyPremiumState(
  dataSource: DataSource,
  userId: string,
) {
  const userRepo = dataSource.getRepository(User);
  const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    return null;
  }

  const activeEnrollments = await enrollmentRepo.find({
    where: { userId, status: EnrollmentStatus.ACTIVE },
  });

  const now = new Date();
  const validActiveEnrollments = activeEnrollments.filter(
    (enrollment) =>
      !enrollment.expiresAt || new Date(enrollment.expiresAt) >= now,
  );

  user.isPremium = validActiveEnrollments.length > 0;

  if (!user.isPremium) {
    user.premiumExpiresAt = null;
  } else {
    const latestExpiry = validActiveEnrollments.reduce<Date | null>(
      (latest, enrollment) => {
        if (!enrollment.expiresAt) {
          return latest;
        }

        if (!latest || enrollment.expiresAt > latest) {
          return enrollment.expiresAt;
        }

        return latest;
      },
      null,
    );

    user.premiumExpiresAt = latestExpiry;
  }

  return await userRepo.save(user);
}
