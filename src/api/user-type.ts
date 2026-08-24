import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/auth";
import type {
  CreateUserTypePayload,
  UpdateUserTypePayload,
  UserType,
} from "@/types/user-type";

export const userTypeApi = {
  getAll: async (): Promise<ApiResponse<UserType[]>> => {
    const { data } = await apiClient.get<ApiResponse<UserType[]>>(
      "/api/v1/admin/roles"
    );
    return data;
  },

  getAllActive: async (): Promise<ApiResponse<UserType[]>> => {
    const { data } = await apiClient.get<ApiResponse<UserType[]>>(
      "/api/v1/admin/roles/active"
    );
    return data;
  },

  create: async (
    payload: CreateUserTypePayload
  ): Promise<ApiResponse<UserType>> => {
    const { data } = await apiClient.post<ApiResponse<UserType>>(
      "/api/v1/admin/roles",
      payload
    );
    return data;
  },

  update: async (
    id: string,
    payload: UpdateUserTypePayload
  ): Promise<ApiResponse<UserType>> => {
    const { data } = await apiClient.put<ApiResponse<UserType>>(
      `/api/v1/admin/roles/${id}`,
      payload
    );
    return data;
  },

  toggle: async (id: string): Promise<ApiResponse<UserType>> => {
    const { data } = await apiClient.patch<ApiResponse<UserType>>(
      `/api/v1/admin/roles/${id}/toggle`
    );
    return data;
  },
};
