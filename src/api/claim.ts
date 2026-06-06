import { apiClient } from "@/lib/apiClient";
import type {
  ClaimCaseStatus,
  ClaimListParams,
  ClaimListResponse,
  ClaimRequest,
  ClaimStats,
  ContactCategory,
} from "@/types/claim";

interface ApiResponse<T> {
  data: T;
}

export const claimApi = {
  getAll: async (params?: ClaimListParams): Promise<ClaimListResponse> => {
    const { data } = await apiClient.get<ClaimListResponse>(
      "/api/v1/admin/contact-cases",
      { params }
    );
    return data;
  },

  getStats: async (): Promise<ClaimStats> => {
    const { data } = await apiClient.get<ApiResponse<ClaimStats>>(
      "/api/v1/admin/contact-cases/summary"
    );
    return data.data;
  },

  getById: async (id: string): Promise<ClaimRequest> => {
    const { data } = await apiClient.get<ApiResponse<ClaimRequest>>(
      `/api/v1/admin/contact-cases/${id}`
    );
    return data.data;
  },

  markRead: async (id: string): Promise<ClaimRequest> => {
    const { data } = await apiClient.patch<ApiResponse<ClaimRequest>>(
      `/api/v1/admin/contact-cases/${id}/read`
    );
    return data.data;
  },

  updateStatus: async (
    id: string,
    status: ClaimCaseStatus
  ): Promise<ClaimRequest> => {
    const { data } = await apiClient.patch<ApiResponse<ClaimRequest>>(
      `/api/v1/admin/contact-cases/${id}/status`,
      { status }
    );
    return data.data;
  },

  delete: async (id: string): Promise<ClaimRequest> => {
    const { data } = await apiClient.delete<ApiResponse<ClaimRequest>>(
      `/api/v1/admin/contact-cases/${id}`
    );
    return data.data;
  },

  getCategories: async (): Promise<ContactCategory[]> => {
    const { data } = await apiClient.get<ApiResponse<ContactCategory[]>>(
      "/api/v1/admin/contact-cases/categories/list"
    );
    return data.data;
  },
};
