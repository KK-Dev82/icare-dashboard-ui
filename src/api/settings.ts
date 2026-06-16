import { apiClient } from "@/lib/apiClient";
import type { SettingItem, UpdateSettingsPayload } from "@/types/settings";

type ApiResponse<T> = T | { data: T };

function unwrapData<T>(response: ApiResponse<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    return response.data as T;
  }
  return response as T;
}

export const settingsApi = {
  getSettings: async (): Promise<SettingItem[]> => {
    const { data } = await apiClient.get<ApiResponse<SettingItem[]>>(
      "/api/v1/admin/settings",
    );
    return unwrapData(data);
  },

  updateSettings: async (payload: UpdateSettingsPayload): Promise<SettingItem[]> => {
    const { data } = await apiClient.patch<ApiResponse<SettingItem[]>>(
      "/api/v1/admin/settings",
      payload,
    );
    return unwrapData(data);
  },
};
