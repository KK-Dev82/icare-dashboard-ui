import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/auth";
import type { PolicyCategory, CreatePolicyCategoryPayload, UpdatePolicyCategoryPayload } from "@/types/policy-category";

export const policyCategoryApi = {
  getAll: async (): Promise<ApiResponse<PolicyCategory[]>> => {
    const { data } = await apiClient.get<ApiResponse<PolicyCategory[]>>(
      "/api/v1/admin/policy-categories"
    );
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<PolicyCategory>> => {
    const { data } = await apiClient.get<ApiResponse<PolicyCategory>>(
      `/api/v1/admin/policy-categories/${id}`
    );
    return data;
  },

  create: async (payload: CreatePolicyCategoryPayload): Promise<ApiResponse<PolicyCategory>> => {
    const { data } = await apiClient.post<ApiResponse<PolicyCategory>>(
      "/api/v1/admin/policy-categories",
      payload
    );
    return data;
  },

  update: async (id: string, payload: UpdatePolicyCategoryPayload): Promise<ApiResponse<PolicyCategory>> => {
    const { data } = await apiClient.patch<ApiResponse<PolicyCategory>>(
      `/api/v1/admin/policy-categories/${id}`,
      payload
    );
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<PolicyCategory>> => {
    const { data } = await apiClient.delete<ApiResponse<PolicyCategory>>(
      `/api/v1/admin/policy-categories/${id}`
    );
    return data;
  },
};
