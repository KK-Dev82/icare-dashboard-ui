export interface SettingsImage {
  path: string;
  fileName: string;
  isActive: boolean;
}

export interface SystemSettingItem {
  id: number;
  label: string;
  value: string;
}

export interface PolicyTypeSettingItem {
  id: number;
  name: string;
  isActive: boolean;
  bannerImage: SettingsImage;
  iconImage: SettingsImage;
}

export interface NewsPromotionSettingItem {
  id: number;
  label: string;
  value: string;
  isActive: boolean;
  bannerImage: SettingsImage;
}

export interface SettingsData {
  systemSettings: SystemSettingItem[];
  policyTypeSettings: PolicyTypeSettingItem[];
  newsPromotionSettings: NewsPromotionSettingItem[];
}

export type UpdateSettingsPayload = Partial<SettingsData>;
