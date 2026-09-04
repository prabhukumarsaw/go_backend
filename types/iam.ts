// ─── IAM Types ──────────────────────────────────
// Mirrors Go backend IAM models

export interface Role {
  id: number;
  tenant_id: number;
  name: string;
  description: string;
  is_system: boolean;
  created_at: string;
}

export interface Menu {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

export interface MenuAction {
  id: number;
  menu_id: number;
  action: string;
  label: string;
}

export interface AuditLogEntry {
  id: number;
  user_id: number;
  action: string;
  resource_type: string;
  resource_id: string;
  details: unknown;
  ip_address: string;
  created_at: string;
  user_name?: string;
}

export interface RolePermission {
  role_id: number;
  menu_action_ids: number[];
}

export interface UserRoleAssignment {
  tenant_id: number;
  role_id: number;
}
