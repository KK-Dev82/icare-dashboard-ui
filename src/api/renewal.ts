import { apiClient } from "@/lib/apiClient";
import type {
  CreateRenewalRulePayload,
  RenewalRule,
  UpdateRenewalRulePayload,
} from "@/types/renewal";

type ApiResponse<T> = T | { data: T };

function unwrapData<T>(response: ApiResponse<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    return response.data as T;
  }
  return response as T;
}

export const renewalApi = {
  getRules: async (): Promise<RenewalRule[]> => {
    const { data } = await apiClient.get<ApiResponse<RenewalRule[]>>(
      "/api/v1/admin/renewal/rules",
    );
    return unwrapData(data);
  },

  createRule: async (payload: CreateRenewalRulePayload): Promise<RenewalRule> => {
    const { data } = await apiClient.post<ApiResponse<RenewalRule>>(
      "/api/v1/admin/renewal/rules",
      payload,
    );
    return unwrapData(data);
  },

  updateRule: async (
    id: string,
    payload: UpdateRenewalRulePayload,
  ): Promise<RenewalRule> => {
    const { data } = await apiClient.patch<ApiResponse<RenewalRule>>(
      `/api/v1/admin/renewal/rules/${id}`,
      payload,
    );
    return unwrapData(data);
  },
};
