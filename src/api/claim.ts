import { apiClient } from "@/lib/apiClient";
import type { Claim, ClaimStatus } from "@/types/claim";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface ClaimListResponse {
  success: boolean;
  data: Claim[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const claimApi = {
  getByPhone: async (phone: string, params?: { page?: number; limit?: number }): Promise<ClaimListResponse> => {
    const { data } = await apiClient.get<ClaimListResponse>(
      "/api/v1/admin/claims",
      { params: { phone, ...params } }
    );
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<Claim>> => {
    const { data } = await apiClient.get<ApiResponse<Claim>>(
      `/api/v1/admin/claims/${id}`
    );
    return data;
  },

  getStatuses: async (id: number): Promise<ApiResponse<ClaimStatus[]>> => {
    const { data } = await apiClient.get<ApiResponse<ClaimStatus[]>>(
      `/api/v1/admin/claims/${id}/statuses`
    );
    return data;
  },
};
