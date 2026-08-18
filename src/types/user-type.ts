export type UserTypeStatus = "ACTIVE" | "INACTIVE";

export type PermissionKey =
  | "DASHBOARD"
  | "MEMBERS"
  | "NEWS"
  | "POLICIES"
  | "CONTACT_CASE"
  | "PRODUCT_INTEREST"
  | "ACCOUNTS"
  | "USER_TYPES"
  | "ACTIVITY_LOG"
  | "SETTINGS"
  | "CONSENTS";

export interface UserType {
  id: string;
  code: string;
  name: string;
  permissions: PermissionKey[];
  status: UserTypeStatus;
  createdAt: string;
  updatedAt: string;
}

