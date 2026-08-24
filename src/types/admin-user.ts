import type { UserType } from "@/types/user-type";

export type AdminRole = string;
export type AdminStatus = "ACTIVE" | "INACTIVE";

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  role: AdminRole;
  roleId: string | null;
  roleRef: UserType | null;
  status: AdminStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAdminPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  roleId: string;
}

export interface UpdateAdminPayload {
  fullName?: string;
  email?: string;
  roleId?: string;
  status?: AdminStatus;
  password?: string;
}
