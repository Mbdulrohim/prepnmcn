import {
  UserProgramEnrollment,
  EnrollmentStatus,
} from "../entities/UserProgramEnrollment";
import { getDataSource } from "./database";

/**
 * Get all active (non-expired) enrollments for a user
 */
export async function getUserActiveEnrollments(
  userId: string
): Promise<UserProgramEnrollment[]> {
  const dataSource = await getDataSource();
  const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

  const enrollments = await enrollmentRepo.find({
    where: {
      userId,
      status: EnrollmentStatus.ACTIVE,
    },
    relations: ["program"],
  });

  // Filter out expired enrollments
  return enrollments.filter((enrollment) => {
    if (!enrollment.expiresAt) return true;
    return new Date() <= new Date(enrollment.expiresAt);
  });
}

/**
 * Alias for backward compatibility
 */
export const getActiveEnrollments = getUserActiveEnrollments;

/**
 * Check if user has access to a specific program
 */
export async function hasAccessToProgram(
  userId: string,
  programCode: string
): Promise<boolean> {
  const activeEnrollments = await getUserActiveEnrollments(userId);
  return activeEnrollments.some(
    (e) => e.program && (e.program as any).code === programCode
  );
}

/**
 * Check if an enrollment is expired
 */
export function isEnrollmentExpired(
  enrollment: UserProgramEnrollment
): boolean {
  if (!enrollment.expiresAt) {
    return false; // No expiration date means never expires
  }
  return new Date() > new Date(enrollment.expiresAt);
}

/**
 * Calculate expiry date from current date and duration in months
 */
export function getEnrollmentExpiryDate(months: number): Date {
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + months);
  return expiryDate;
}

/**
 * Check if user has any active program enrollment
 */
export async function hasAnyActiveEnrollment(userId: string): Promise<boolean> {
  const enrollments = await getUserActiveEnrollments(userId);
  return enrollments.length > 0;
}

/**
 * Get program codes user is enrolled in
 */
export async function getUserProgramCodes(userId: string): Promise<string[]> {
  const enrollments = await getUserActiveEnrollments(userId);
  return enrollments
    .map((e) => (e.program as any)?.code)
    .filter((code: any): code is string => !!code);
}
