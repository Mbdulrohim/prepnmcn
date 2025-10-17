// User role constants and validation
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.USER]: "User",
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.SUPER_ADMIN]: "Super Admin",
};

export const ADMIN_ROLES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.SUPER_ADMIN,
];

export const isValidRole = (role: string): role is UserRole => {
  return Object.values(USER_ROLES).includes(role as UserRole);
};

export const isAdminRole = (role: UserRole): boolean => {
  return ADMIN_ROLES.includes(role);
};

export const validateRole = (role: string): UserRole => {
  if (isValidRole(role)) {
    return role;
  }
  console.warn(
    `Invalid role "${role}" provided, defaulting to "${USER_ROLES.USER}"`
  );
  return USER_ROLES.USER;
};

export const getDefaultRole = (): UserRole => USER_ROLES.USER;
