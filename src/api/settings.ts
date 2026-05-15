import { apiClient } from "@/lib/apiClient";
import type { SettingsData, UpdateSettingsPayload } from "@/types/settings";
import settingsData from "@/mock-data/settings.json";

const USE_MOCK = true;

export const settingsApi = {
  getSettings: async (): Promise<SettingsData> => {
    if (USE_MOCK) {
      return settingsData as SettingsData;
    }
    const { data } = await apiClient.get("/api/v1/admin/settings");
    return data.data;
  },

  updateSettings: async (payload: UpdateSettingsPayload): Promise<SettingsData> => {
    if (USE_MOCK) {
      return {
        ...(settingsData as SettingsData),
        ...payload,
      };
    }
    const { data } = await apiClient.patch("/api/v1/admin/settings", payload);
    return data.data;
  },
};
