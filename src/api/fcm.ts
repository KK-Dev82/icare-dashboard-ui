import { apiClient } from "@/lib/apiClient";

export interface FcmConfig {
  id: string;
  type: string;
  projectId: string;
  privateKeyId: string;
  privateKey: string;
  clientEmail: string;
  clientId: string;
  authUri: string;
  tokenUri: string;
  authProviderX509CertUrl: string;
  clientX509CertUrl: string;
  universeDomain: string;
  updatedAt: string;
}

export interface UpdateFcmConfigPayload {
  projectId: string;
  privateKeyId: string;
  privateKey: string;
  clientEmail: string;
  clientId: string;
  clientX509CertUrl: string;
}

export const fcmApi = {
  get: async (): Promise<FcmConfig | null> => {
    const { data } = await apiClient.get<{ success: boolean; data: FcmConfig | null }>(
      "/api/v1/admin/settings/fcm",
    );
    return data.data;
  },

  update: async (payload: UpdateFcmConfigPayload): Promise<FcmConfig> => {
    const { data } = await apiClient.put<{ success: boolean; data: FcmConfig }>(
      "/api/v1/admin/settings/fcm",
      payload,
    );
    return data.data;
  },
};
