export type PermissionKey =
  | "DASHBOARD"
  | "MEMBERS"
  | "NEWS"
  | "POLICIES"
  | "CONTACT_CASE"
  | "PRODUCT_INTEREST"
  | "ACCOUNTS"
  | "SETTINGS"
  | "CONSENTS"
  | "NOTIFICATIONS";

export interface UserType {
  id: string;
  name: string;
  permissions: PermissionKey[];
  mailContactCase: boolean;
  mailLeads: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserTypePayload {
  name: string;
  permissions: PermissionKey[];
  mailContactCase: boolean;
  mailLeads: boolean;
}

export type UpdateUserTypePayload = Partial<CreateUserTypePayload>;
