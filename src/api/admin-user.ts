import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/auth";
import type { AdminUser, CreateAdminPayload, UpdateAdminPayload } from "@/types/admin-user";

export const adminUserApi = {
  getAll: async (): Promise<ApiResponse<AdminUser[]>> => {
    const { data } = await apiClient.get<ApiResponse<AdminUser[]>>(
      "/api/v1/admin/users"
    );
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<AdminUser>> => {
    const { data } = await apiClient.get<ApiResponse<AdminUser>>(
      `/api/v1/admin/users/${id}`
    );
    return data;
  },

  create: async (payload: CreateAdminPayload): Promise<ApiResponse<AdminUser>> => {
    const { data } = await apiClient.post<ApiResponse<AdminUser>>(
      "/api/v1/admin/users",
      payload
    );
    return data;
  },

  update: async (id: string, payload: UpdateAdminPayload): Promise<ApiResponse<AdminUser>> => {
    const { data } = await apiClient.patch<ApiResponse<AdminUser>>(
      `/api/v1/admin/users/${id}`,
      payload
    );
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<AdminUser>> => {
    const { data } = await apiClient.delete<ApiResponse<AdminUser>>(
      `/api/v1/admin/users/${id}`
    );
    return data;
  },
};
