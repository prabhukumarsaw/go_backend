import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";

export interface Role {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
  user_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  label: string;
  parent_id?: number | null;
  icon?: string;
  path?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface MenuActionMatrixItem {
  action_id: number;
  action: string;
  label: string;
  granted: boolean;
}

export interface MenuMatrixItem {
  menu_id: number;
  name: string;
  label: string;
  icon: string;
  sort_order: number;
  actions: MenuActionMatrixItem[];
}

export interface CategoryScope {
  category_id: number;
  name: string;
  slug: string;
  path: string;
  level: number;
}

export interface EffectivePermissions {
  user_id: number;
  is_super_admin: boolean;
  roles: string[];
  permissions: string[];
  category_scopes: CategoryScope[];
}

export interface StaffUserRoleSummary {
  user_id: number;
  display_name: string;
  email: string;
  role_id?: number | null;
  role_name?: string | null;
  is_super_admin: boolean;
  is_active: boolean;
  category_scopes: CategoryScope[];
}

export interface AuditLogEntry {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  action_name: string;
  decision: string;
  reason: string;
  ip_address: string;
  user_agent: string;
  request_id: string;
  created_at: string;
}

// ─── Roles CRUD & Governance ───────────────────

export function listRoles() {
  return apiClient.get<ApiResponse<Role[]>>("/iam/roles");
}

export function getRole(roleId: number) {
  return apiClient.get<ApiResponse<Role>>(`/iam/roles/${roleId}`);
}

export function createRole(data: { name: string; description?: string }) {
  return apiClient.post<ApiResponse<Role>>("/iam/roles", data);
}

export function updateRole(roleId: number, data: { name: string; description?: string }) {
  return apiClient.put<ApiResponse<Role>>(`/iam/roles/${roleId}`, data);
}

export function deleteRole(roleId: number) {
  return apiClient.delete<ApiResponse<{ message: string }>>(`/iam/roles/${roleId}`);
}

export function cloneRole(roleId: number, data: { name: string; description?: string }) {
  return apiClient.post<ApiResponse<Role>>(`/iam/roles/${roleId}/clone`, data);
}

export function applyRoleTemplate(roleId: number, template: string) {
  return apiClient.post<ApiResponse<{ message: string }>>(`/iam/roles/${roleId}/template`, { template });
}

export function getRolePermissionMatrix(roleId: number) {
  return apiClient.get<ApiResponse<MenuMatrixItem[]>>(`/iam/roles/${roleId}/matrix`);
}

export function assignRolePermissions(roleId: number, menuActionIds: number[]) {
  return apiClient.put<ApiResponse<{ message: string }>>(`/iam/roles/${roleId}/permissions`, {
    action_ids: menuActionIds,
  });
}

// ─── Menus & Actions ───────────────────────────

export function listMenus() {
  return apiClient.get<ApiResponse<MenuItem[]>>("/menus");
}

// ─── Staff & Scoping Governance ────────────────

export function listStaffWithRoles(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiClient.get<ApiResponse<StaffUserRoleSummary[]>>(`/iam/staff${query}`);
}

export function assignUserRole(userId: number, data: { role_id: number }) {
  return apiClient.post<ApiResponse<{ message: string }>>(`/iam/users/${userId}/roles`, data);
}

export function getUserCategoryScopes(userId: number) {
  return apiClient.get<ApiResponse<CategoryScope[]>>(`/iam/users/${userId}/categories`);
}

export function assignUserCategoryScopes(userId: number, categoryIds: number[]) {
  return apiClient.post<ApiResponse<{ message: string }>>(`/iam/users/${userId}/categories`, {
    category_ids: categoryIds,
  });
}

// Backward compatibility alias
export function getUserDistrictScopes(userId: number) {
  return apiClient.get<ApiResponse<number[]>>(`/iam/users/${userId}/districts`);
}

export function assignUserDistrictScopes(userId: number, districtIds: number[]) {
  return apiClient.post<ApiResponse<{ message: string }>>(`/iam/users/${userId}/districts`, {
    district_ids: districtIds,
  });
}

// ─── Effective Permissions ─────────────────────

export function getUserEffectivePermissions(userId: number) {
  return apiClient.get<ApiResponse<EffectivePermissions>>(`/iam/users/${userId}/permissions`);
}

export function getMyEffectivePermissions() {
  return apiClient.get<ApiResponse<EffectivePermissions>>("/iam/me/permissions");
}

// ─── Overrides & ABAC ───────────────────────────

export function createPermissionOverride(data: {
  user_id: number;
  menu_action_id: number;
  effect: "GRANT" | "REVOKE";
  reason: string;
  valid_from?: string;
  valid_until?: string;
}) {
  return apiClient.post<ApiResponse<{ message: string }>>("/iam/overrides", data);
}

// ─── Audit Trail ────────────────────────────────

export function listAuditLogs(page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  return apiClient.get<ApiResponse<AuditLogEntry[]>>(`/iam/audit-log?limit=${limit}&offset=${offset}`);
}
