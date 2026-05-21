export interface SettingItem {
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export interface UpdateSettingsPayload {
  settings: { key: string; value: string }[];
}
