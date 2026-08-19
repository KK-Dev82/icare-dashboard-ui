export type PermissionKey =
  | "DASHBOARD"
  | "MEMBERS"
  | "NEWS"
  | "POLICIES"
  | "CONTACT_CASE"
  | "PRODUCT_INTEREST"
  | "ACCOUNTS"
  | "SETTINGS"
  | "CONSENTS";

export interface UserType {
  id: string;
  name: string;
  permissions: PermissionKey[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserTypePayload {
  name: string;
  permissions: PermissionKey[];
}

export type UpdateUserTypePayload = Partial<CreateUserTypePayload>;
