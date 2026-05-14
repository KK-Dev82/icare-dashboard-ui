export type AdminUserRole = "SUPER_ADMIN" | "ADMIN";

export type AdminUserStatus = "ACTIVE" | "INACTIVE";

export interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  fullName: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
}

export interface CreateAdminUserPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: AdminUserRole;
}

export interface UpdateAdminUserPayload {
  fullName?: string;
  email?: string;
  role?: AdminUserRole;
  status?: AdminUserStatus;
  password?: string;
}
