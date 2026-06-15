import { apiClient } from "@/lib/apiClient";
import type {
  ProductInterest,
  ProductInterestListParams,
  ProductInterestListResponse,
  ProductInterestStats,
  ProductInterestStatus,
} from "@/types/product-interest";

interface ApiResponse<T> {
  data: T;
}

export const productInterestApi = {
  getAll: async (
    params?: ProductInterestListParams
  ): Promise<ProductInterestListResponse> => {
    const { data } = await apiClient.get<ProductInterestListResponse>(
      "/api/v1/admin/leads",
      { params }
    );
    return data;
  },

  getStats: async (): Promise<ProductInterestStats> => {
    const { data } = await apiClient.get<ApiResponse<ProductInterestStats>>(
      "/api/v1/admin/leads/summary"
    );
    return data.data;
  },

  getById: async (id: string): Promise<ProductInterest> => {
    const { data } = await apiClient.get<ApiResponse<ProductInterest>>(
      `/api/v1/admin/leads/${id}`
    );
    return data.data;
  },

  updateStatus: async (
    id: string,
    status: ProductInterestStatus
  ): Promise<ProductInterest> => {
    const { data } = await apiClient.patch<ApiResponse<ProductInterest>>(
      `/api/v1/admin/leads/${id}/status`,
      { status }
    );
    return data.data;
  },

  delete: async (id: string): Promise<ProductInterest> => {
    const { data } = await apiClient.delete<ApiResponse<ProductInterest>>(
      `/api/v1/admin/leads/${id}`
    );
    return data.data;
  },
};
