import { UserProgramEnrollment } from "../entities/UserProgramEnrollment";

/**
 * Get list of active enrollments for a user
 */
export async function getActiveEnrollments(
  userId: string
): Promise<UserProgramEnrollment[]> {
  const { getDataSource } = await import("./database");
  const dataSource = await getDataSource();
  const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

  const enrollments = await enrollmentRepo.find({
    where: { userId, status: "active" as any },
    relations: ["program"],
  });

  // Filter out expired enrollments
  return enrollments.filter((e) => {
    if (!e.expiresAt) return true;
    return new Date() <= new Date(e.expiresAt);
  });
}

/**
 * Check if user has access to a specific program
 */
export async function hasAccessToProgram(
  userId: string,
  programCode: string
): Promise<boolean> {
  const activeEnrollments = await getActiveEnrollments(userId);
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
  const enrollments = await getActiveEnrollments(userId);
  return enrollments.length > 0;
}

/**
 * Get program codes user is enrolled in
 */
export async function getUserProgramCodes(userId: string): Promise<string[]> {
  const enrollments = await getActiveEnrollments(userId);
  return enrollments
    .map((e) => (e.program as any)?.code)
    .filter((code): code is string => !!code);
}
