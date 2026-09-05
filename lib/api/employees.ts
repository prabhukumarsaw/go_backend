import { apiClient, type ApiResponse } from "./client";

export interface Employee {
  id: number;
  user_id: number;
  employee_code: string;
  display_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  department: string;
  designation: string;
  district_id?: number;
  district_name?: string;
  role_name?: string;
  address?: string;
  pin_code?: string;
  bio?: string;
  press_card_no?: string;
  x_handle?: string;
  is_active: boolean;
  article_count: number;
  total_views: number;
  joined_at: string;
  created_at: string;
}

export interface OnboardEmployeePayload {
  user_id?: number;
  display_name: string;
  email: string;
  phone: string;
  password?: string;
  avatar_url?: string;
  employee_code: string;
  department: string;
  designation: string;
  district_id?: number;
  role_id?: number;
  address?: string;
  pin_code?: string;
  bio?: string;
  press_card_no?: string;
  x_handle?: string;
}

export async function listEmployees(
  department?: string,
  search?: string
): Promise<ApiResponse<Employee[]>> {
  const params: Record<string, string | number> = {};
  if (department && department !== "all") params.department = department;
  if (search) params.q = search;

  return apiClient.get<ApiResponse<Employee[]>>("/admin/employees", params);
}

export async function onboardEmployee(
  payload: OnboardEmployeePayload
): Promise<ApiResponse<Employee>> {
  return apiClient.post<ApiResponse<Employee>>("/admin/employees", payload);
}

export async function updateEmployeeStatus(
  id: number,
  isActive: boolean
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.patch<ApiResponse<{ message: string }>>(`/admin/employees/${id}/status`, {
    is_active: isActive,
  });
}

export async function deleteEmployee(
  id: number
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.delete<ApiResponse<{ message: string }>>(`/admin/employees/${id}`);
}
