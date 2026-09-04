import type { User } from "@/types/auth";

export interface PermissionCheckOptions {
  user: User | null;
  requiredPermission?: string;
  requireStaff?: boolean;
  requireSuperAdmin?: boolean;
}

/**
 * Checks if a user meets role/permission criteria for CMS actions.
 */
export function hasPermission({
  user,
  requireStaff = false,
  requireSuperAdmin = false,
}: PermissionCheckOptions): boolean {
  if (!user) return false;
  if (!user.is_active) return false;
  if (user.is_super_admin) return true;
  if (requireSuperAdmin && !user.is_super_admin) return false;
  if (requireStaff && !user.is_staff) return false;
  return true;
}
