import { apiClient } from "@/lib/apiClient";
import type {
  ConsentPolicy,
  ConsentScene,
  ConsentType,
  ConsentUserAcceptance,
  CreateConsentPolicyPayload,
  CreateConsentTypePayload,
  PaginatedResponse,
  UpdateConsentPolicyPayload,
  UpdateConsentTypePayload,
} from "@/types/consent";

type DataEnvelope<T> = T | { data: T };

function unwrapData<T>(response: DataEnvelope<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    return response.data as T;
  }
  return response as T;
}

interface ConsentPolicyListParams {
  typeId?: string;
  scene?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface UserConsentListParams {
  consentPolicyId?: string;
  page?: number;
  limit?: number;
}

export const consentApi = {
  getTypes: async (): Promise<ConsentType[]> => {
    const { data } = await apiClient.get<DataEnvelope<ConsentType[]>>(
      "/api/v1/admin/consent/types",
    );
    return unwrapData(data);
  },

  createType: async (
    payload: CreateConsentTypePayload,
  ): Promise<ConsentType> => {
    const { data } = await apiClient.post<DataEnvelope<ConsentType>>(
      "/api/v1/admin/consent/types",
      payload,
    );
    return unwrapData(data);
  },

  updateType: async (
    id: string,
    payload: UpdateConsentTypePayload,
  ): Promise<ConsentType> => {
    const { data } = await apiClient.patch<DataEnvelope<ConsentType>>(
      `/api/v1/admin/consent/types/${id}`,
      payload,
    );
    return unwrapData(data);
  },

  getScenes: async (): Promise<ConsentScene[]> => {
    const { data } = await apiClient.get<DataEnvelope<ConsentScene[]>>(
      "/api/v1/admin/consent/scenes",
    );
    return unwrapData(data);
  },

  getPolicies: async (
    params?: ConsentPolicyListParams,
  ): Promise<PaginatedResponse<ConsentPolicy>> => {
    const { data } = await apiClient.get<PaginatedResponse<ConsentPolicy>>(
      "/api/v1/admin/consent/policies",
      { params },
    );
    return data;
  },

  getPolicyById: async (id: string): Promise<ConsentPolicy> => {
    const { data } = await apiClient.get<DataEnvelope<ConsentPolicy>>(
      `/api/v1/admin/consent/policies/${id}`,
    );
    return unwrapData(data);
  },

  createPolicy: async (
    payload: CreateConsentPolicyPayload,
  ): Promise<ConsentPolicy> => {
    const { data } = await apiClient.post<DataEnvelope<ConsentPolicy>>(
      "/api/v1/admin/consent/policies",
      payload,
    );
    return unwrapData(data);
  },

  updatePolicy: async (
    id: string,
    payload: UpdateConsentPolicyPayload,
  ): Promise<ConsentPolicy> => {
    const { data } = await apiClient.patch<DataEnvelope<ConsentPolicy>>(
      `/api/v1/admin/consent/policies/${id}`,
      payload,
    );
    return unwrapData(data);
  },

  publishPolicy: async (id: string): Promise<ConsentPolicy> => {
    const { data } = await apiClient.post<DataEnvelope<ConsentPolicy>>(
      `/api/v1/admin/consent/policies/${id}/publish`,
    );
    return unwrapData(data);
  },

  archivePolicy: async (id: string): Promise<ConsentPolicy> => {
    const { data } = await apiClient.post<DataEnvelope<ConsentPolicy>>(
      `/api/v1/admin/consent/policies/${id}/archive`,
    );
    return unwrapData(data);
  },

  getPolicyVersions: async (typeId: string): Promise<ConsentPolicy[]> => {
    const { data } = await apiClient.get<DataEnvelope<ConsentPolicy[]>>(
      `/api/v1/admin/consent/policies/versions/${typeId}`,
    );
    return unwrapData(data);
  },

  getUserConsents: async (
    params?: UserConsentListParams,
  ): Promise<PaginatedResponse<ConsentUserAcceptance>> => {
    const { data } = await apiClient.get<
      PaginatedResponse<ConsentUserAcceptance>
    >("/api/v1/admin/consent/user-consents", { params });
    return data;
  },

  getExternalPolicy: async (): Promise<{ content: string; updatedAt: string }> => {
    const { data } = await apiClient.get<DataEnvelope<{ content: string; updatedAt: string }>>(
      "/api/v1/admin/consent/external-policy",
    );
    return unwrapData(data);
  },
};
