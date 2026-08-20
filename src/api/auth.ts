import { apiClient } from "@/lib/apiClient";
import type { AdminUser } from "@/types/admin-user";
import type { ApiResponse, LoginRequest, LoginResponse } from "@/types/auth";

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/api/v1/admin/auth/login",
      payload
    );
    return data;
  },

  getProfile: async (): Promise<ApiResponse<AdminUser>> => {
    const { data } = await apiClient.get<ApiResponse<AdminUser>>(
      "/api/v1/admin/profile"
    );
    return data;
  },
};
