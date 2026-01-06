import { getDataSource } from "./database";
import { ProgramAdmin } from "../entities/ProgramAdmin";
import {
  UserProgramEnrollment,
  EnrollmentStatus,
} from "../entities/UserProgramEnrollment";
import { USER_ROLES, UserRole } from "./roles";

/**
 * Check if a user is a super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const dataSource = await getDataSource();
  const userRepo = dataSource.getRepository("User");
  const user = await userRepo.findOne({ where: { id: userId } });
  return user?.role === USER_ROLES.SUPER_ADMIN;
}

/**
 * Check if a user can manage a specific program
 * Super admins can manage all programs
 * Program admins can only manage programs they're assigned to
 */
export async function canManageProgram(
  userId: string,
  programId: string
): Promise<boolean> {
  // Check if super admin
  if (await isSuperAdmin(userId)) {
    return true;
  }

  // Check if user is a program admin for this specific program
  const dataSource = await getDataSource();
  const programAdminRepo = dataSource.getRepository(ProgramAdmin);

  const programAdmin = await programAdminRepo.findOne({
    where: {
      userId,
      programId,
      isActive: true,
    },
  });

  return !!programAdmin;
}

/**
 * Get list of programs a user can manage
 * Returns all programs for super admin, or only assigned programs for program admins
 */
export async function getUserManagedPrograms(
  userId: string
): Promise<string[]> {
  const dataSource = await getDataSource();

  // If super admin, return all program IDs
  if (await isSuperAdmin(userId)) {
    const programRepo = dataSource.getRepository("Program");
    const programs = await programRepo.find({ where: { isActive: true } });
    return programs.map((p: any) => p.id);
  }

  // Otherwise, get admin's assigned programs
  const programAdminRepo = dataSource.getRepository(ProgramAdmin);
  const assignments = await programAdminRepo.find({
    where: {
      userId,
      isActive: true,
    },
    relations: ["program"],
  });

  return assignments.filter((a) => a.program?.isActive).map((a) => a.programId);
}

/**
 * Check if user can grant premium access (enroll users in a program)
 * Only super admins and program admins for the specific program
 */
export async function canGrantPremiumAccess(
  adminId: string,
  programId: string
): Promise<boolean> {
  return await canManageProgram(adminId, programId);
}

/**
 * Check if user can view resources for a specific program
 * User must have an active enrollment in the program
 */
export async function canViewProgramResources(
  userId: string,
  programId: string
): Promise<boolean> {
  const dataSource = await getDataSource();
  const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

  const enrollment = await enrollmentRepo.findOne({
    where: {
      userId,
      programId,
      status: EnrollmentStatus.ACTIVE,
    },
  });

  if (!enrollment) {
    return false;
  }

  // Check if enrollment has expired
  if (enrollment.expiresAt && new Date() > new Date(enrollment.expiresAt)) {
    return false;
  }

  return true;
}

/**
 * Check if user can access an exam for a specific program
 * Same rules as resource access
 */
export async function canAccessProgramExam(
  userId: string,
  programId: string
): Promise<boolean> {
  return await canViewProgramResources(userId, programId);
}

/**
 * Check if user can edit program details
 * Only super admins and assigned program admins
 */
export async function canEditProgram(
  adminId: string,
  programId: string
): Promise<boolean> {
  return await canManageProgram(adminId, programId);
}

/**
 * Check if user can assign program admins
 * Only super admins can assign program admins
 */
export async function canAssignProgramAdmin(userId: string): Promise<boolean> {
  return await isSuperAdmin(userId);
}

/**
 * Get user's active program enrollments
 */
export async function getUserActiveEnrollments(userId: string): Promise<any[]> {
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
    if (!enrollment.expiresAt) {
      return true; // No expiration
    }
    return new Date() <= new Date(enrollment.expiresAt);
  });
}

/**
 * Check if user has access to any program
 */
export async function hasAnyProgramAccess(userId: string): Promise<boolean> {
  const enrollments = await getUserActiveEnrollments(userId);
  return enrollments.length > 0;
}

/**
 * Check if user has access to a specific program by code (RM, RN, etc)
 */
export async function hasAccessToProgramByCode(
  userId: string,
  programCode: string
): Promise<boolean> {
  const dataSource = await getDataSource();
  const enrollmentRepo = dataSource.getRepository(UserProgramEnrollment);

  const enrollment = await enrollmentRepo
    .createQueryBuilder("enrollment")
    .innerJoin("enrollment.program", "program")
    .where("enrollment.userId = :userId", { userId })
    .andWhere("program.code = :programCode", { programCode })
    .andWhere("enrollment.status = :status", {
      status: EnrollmentStatus.ACTIVE,
    })
    .getOne();

  if (!enrollment) {
    return false;
  }

  // Check expiration
  if (enrollment.expiresAt && new Date() > new Date(enrollment.expiresAt)) {
    return false;
  }

  return true;
}
