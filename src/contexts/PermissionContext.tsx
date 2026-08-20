"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { authApi } from "@/api/auth";
import { clearAuthSession } from "@/lib/authStorage";
import {
  getDefaultRoute,
  getProfilePermissions,
} from "@/lib/permissions";
import type { AdminUser } from "@/types/admin-user";
import type { PermissionKey } from "@/types/user-type";

interface PermissionContextValue {
  profile: AdminUser | null;
  permissions: PermissionKey[];
  isSuperAdmin: boolean;
  loading: boolean;
  errorMessage: string | null;
  defaultRoute: string;
  hasPermission: (permission: PermissionKey) => boolean;
  refetchProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const logout = useCallback(() => {
    clearAuthSession();
    setProfile(null);
    router.replace("/login");
  }, [router]);

  const loadProfile = useCallback(
    async (background = false) => {
      if (!localStorage.getItem("accessToken")) {
        logout();
        return;
      }

      if (!background) setLoading(true);

      try {
        const response = await authApi.getProfile();
        if (!response.success) {
          throw new Error(response.message || "โหลดข้อมูลสิทธิ์ไม่สำเร็จ");
        }

        const nextProfile = response.data;
        const isSuperAdmin = nextProfile.role === "SUPER_ADMIN";
        const hasUsableRole =
          isSuperAdmin || Boolean(nextProfile.roleRef?.isActive);
        const sessionRoleId = localStorage.getItem("roleId");
        const roleAssignmentChanged =
          !isSuperAdmin &&
          Boolean(sessionRoleId) &&
          sessionRoleId !== nextProfile.roleId;

        if (
          nextProfile.status !== "ACTIVE" ||
          !hasUsableRole ||
          roleAssignmentChanged
        ) {
          logout();
          return;
        }

        localStorage.setItem("fullName", nextProfile.fullName);
        localStorage.setItem("role", nextProfile.role);
        if (nextProfile.roleId) {
          localStorage.setItem("roleId", nextProfile.roleId);
        } else {
          localStorage.removeItem("roleId");
        }

        setProfile(nextProfile);
        setErrorMessage(null);
      } catch (error) {
        const { status, code, message } = getProfileError(error);
        if (
          status === 401 ||
          code === "ROLE_INACTIVE" ||
          code === "ROLE_NOT_FOUND" ||
          code === "FORBIDDEN"
        ) {
          logout();
          return;
        }

        if (!background) {
          setErrorMessage(message || "ไม่สามารถโหลดข้อมูลสิทธิ์ได้");
        }
      } finally {
        if (!background) setLoading(false);
      }
    },
    [logout]
  );

  const refetchProfile = useCallback(
    () => loadProfile(false),
    [loadProfile]
  );

  const refreshProfile = useCallback(
    () => loadProfile(true),
    [loadProfile]
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadProfile(false);
    }, 0);
    return () => window.clearTimeout(handle);
  }, [loadProfile]);

  useEffect(() => {
    if (!profile) return;
    const handle = window.setTimeout(() => {
      void loadProfile(true);
    }, 0);
    return () => window.clearTimeout(handle);
    // Revalidate when navigating so removed permissions disappear from the UI.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const handleFocus = () => void loadProfile(true);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void loadProfile(true);
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadProfile]);

  const isSuperAdmin = profile?.role === "SUPER_ADMIN";
  const permissions = useMemo(
    () => (profile ? getProfilePermissions(profile) : []),
    [profile]
  );
  const hasPermission = useCallback(
    (permission: PermissionKey) =>
      isSuperAdmin || permissions.includes(permission),
    [isSuperAdmin, permissions]
  );
  const defaultRoute = getDefaultRoute(permissions, isSuperAdmin);

  const value = useMemo<PermissionContextValue>(
    () => ({
      profile,
      permissions,
      isSuperAdmin,
      loading,
      errorMessage,
      defaultRoute,
      hasPermission,
      refetchProfile,
      refreshProfile,
      logout,
    }),
    [
      profile,
      permissions,
      isSuperAdmin,
      loading,
      errorMessage,
      defaultRoute,
      hasPermission,
      refetchProfile,
      refreshProfile,
      logout,
    ]
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used inside PermissionProvider");
  }
  return context;
}

function getProfileError(error: unknown) {
  const response = (
    error as {
      response?: {
        status?: number;
        data?: { errorCode?: string; message?: string | string[] };
      };
    }
  ).response;
  const rawMessage = response?.data?.message;

  return {
    status: response?.status,
    code: response?.data?.errorCode,
    message: Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : rawMessage || (error instanceof Error ? error.message : ""),
  };
}
