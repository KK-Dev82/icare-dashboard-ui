import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/auth";
import type { Policy, CreatePolicyPayload, UpdatePolicyPayload, PolicyUser, PaginationMeta } from "@/types/policy";

interface PoliciesResponse {
  success: boolean;
  data: Policy[];
  meta: PaginationMeta;
  requestId?: string;
}

interface PolicyFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  policyNo?: string;
  customerPhone?: string;
  categoryId?: string;
  status?: string;
}

export const policyApi = {
  getAll: async (filters?: PolicyFilters): Promise<PoliciesResponse> => {
    const { data } = await apiClient.get<PoliciesResponse>(
      "/api/v1/admin/policies",
      { params: filters }
    );
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Policy>> => {
    const { data } = await apiClient.get<ApiResponse<Policy>>(
      `/api/v1/admin/policies/${id}`
    );
    return data;
  },

  create: async (payload: CreatePolicyPayload): Promise<ApiResponse<Policy>> => {
    const { data } = await apiClient.post<ApiResponse<Policy>>(
      "/api/v1/admin/policies",
      payload
    );
    return data;
  },

  update: async (id: string, payload: UpdatePolicyPayload): Promise<ApiResponse<Policy>> => {
    const { data } = await apiClient.patch<ApiResponse<Policy>>(
      `/api/v1/admin/policies/${id}`,
      payload
    );
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<Policy>> => {
    const { data } = await apiClient.delete<ApiResponse<Policy>>(
      `/api/v1/admin/policies/${id}`
    );
    return data;
  },

  getUsers: async (id: string): Promise<ApiResponse<PolicyUser[]>> => {
    const { data } = await apiClient.get<ApiResponse<PolicyUser[]>>(
      `/api/v1/admin/policies/${id}/users`
    );
    return data;
  },
};
