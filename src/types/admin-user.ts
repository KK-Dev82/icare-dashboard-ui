export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "CONTENT_EDITOR";
export type AdminStatus = "ACTIVE" | "INACTIVE";

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminPayload {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  role: AdminRole;
}

export interface UpdateAdminPayload {
  fullName?: string;
  email?: string;
  role?: AdminRole;
  status?: AdminStatus;
  password?: string;
}
