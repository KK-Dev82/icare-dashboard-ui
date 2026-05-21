import { apiClient } from "@/lib/apiClient";
import type { SettingItem, UpdateSettingsPayload } from "@/types/settings";

export const settingsApi = {
  getSettings: async (): Promise<SettingItem[]> => {
    const { data } = await apiClient.get("/api/v1/admin/settings");
    return data.data;
  },

  updateSettings: async (payload: UpdateSettingsPayload): Promise<SettingItem[]> => {
    const { data } = await apiClient.patch("/api/v1/admin/settings", payload);
    return data.data;
  },
};
