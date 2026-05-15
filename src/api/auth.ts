import { apiClient } from "@/lib/apiClient";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/api/v1/admin/auth/login",
      payload
    );
    return data;
  },
};
