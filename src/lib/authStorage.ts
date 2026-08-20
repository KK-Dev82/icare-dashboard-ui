import type { LoginData } from "@/types/auth";

export function saveAuthSession(data: LoginData) {
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("fullName", data.fullName);
  localStorage.setItem("role", data.role);
  if (data.roleId) {
    localStorage.setItem("roleId", data.roleId);
  } else {
    localStorage.removeItem("roleId");
  }
}

export function clearAuthSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("fullName");
  localStorage.removeItem("role");
  localStorage.removeItem("roleId");
}
