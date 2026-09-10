import { apiClient } from './api-client';
import { ApiResponse, PaginatedResponse } from '@/types/vehicle';
import { User, Role, AuditLog, AdminStats } from '@/types/admin';

export const adminApi = {
  // Dashboard
  getStats: () => 
    apiClient.get<ApiResponse<AdminStats>>('/admin/dashboard').then(res => res.data.data),

  // Users
  getUsers: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiClient.get<ApiResponse<PaginatedResponse<User>>>(`/admin/users?${qs}`).then(res => res.data.data);
  },
  
  getUser: (id: number) => 
    apiClient.get<ApiResponse<User>>(`/admin/users/${id}`).then(res => res.data.data),

  createUser: (data: Partial<User> & { password?: string; permissions?: number[] }) => 
    apiClient.post<ApiResponse<User>>('/admin/users', data).then(res => res.data.data),

  updateUser: (id: number, data: Partial<User> & { permissions?: number[] }) => 
    apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data).then(res => res.data.data),

  resetPassword: (id: number, password: string) => 
    apiClient.post<ApiResponse<void>>(`/admin/users/${id}/reset-password`, { password }).then(res => res.data),

  // Roles & Permissions
  getRoles: () => 
    apiClient.get<ApiResponse<{roles: Role[], permissions: Record<string, any[]>}>>('/admin/roles').then(res => res.data.data),

  updateRolePermissions: (roleId: number, permissionIds: number[]) => 
    apiClient.put<ApiResponse<Role>>(`/admin/roles/${roleId}/permissions`, { permissions: permissionIds }).then(res => res.data.data),

  // Audit Logs
  getAuditLogs: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>(`/admin/audit?${qs}`).then(res => res.data.data);
  },

  getAuditLog: (id: number) => 
    apiClient.get<ApiResponse<AuditLog>>(`/admin/audit/${id}`).then(res => res.data.data),

  deleteAuditLog: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/audit/${id}`).then(res => res.data),

  bulkDeleteAuditLogs: (ids: number[]) =>
    apiClient.post<ApiResponse<void>>('/admin/audit/bulk-delete', { ids }).then(res => res.data),

  clearAuditLogs: (days?: number) => {
    const qs = days !== undefined ? `?days=${days}` : '';
    return apiClient.delete<ApiResponse<void>>(`/admin/audit/clear${qs}`).then(res => res.data);
  },
};
