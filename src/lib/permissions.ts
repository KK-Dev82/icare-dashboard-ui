import type { AdminUser } from "@/types/admin-user";
import type { PermissionKey } from "@/types/user-type";

export const ALL_PERMISSIONS: PermissionKey[] = [
  "DASHBOARD",
  "MEMBERS",
  "NEWS",
  "POLICIES",
  "CONTACT_CASE",
  "PRODUCT_INTEREST",
  "ACCOUNTS",
  "SETTINGS",
  "CONSENTS",
];

const routePermissions: Array<{
  prefix: string;
  permission: PermissionKey;
}> = [
  // Legacy account-management screens still live under this old path.
  { prefix: "/policy-categories", permission: "ACCOUNTS" },
  { prefix: "/product-interest", permission: "PRODUCT_INTEREST" },
  { prefix: "/contact-case", permission: "CONTACT_CASE" },
  { prefix: "/consent-types", permission: "CONSENTS" },
  { prefix: "/product-types", permission: "POLICIES" },
  { prefix: "/user-types", permission: "ACCOUNTS" },
  { prefix: "/news-types", permission: "NEWS" },
  { prefix: "/dashboard", permission: "DASHBOARD" },
  { prefix: "/accounts", permission: "ACCOUNTS" },
  { prefix: "/settings", permission: "SETTINGS" },
  { prefix: "/policies", permission: "POLICIES" },
  { prefix: "/consents", permission: "CONSENTS" },
  { prefix: "/members", permission: "MEMBERS" },
  { prefix: "/news", permission: "NEWS" },
];

const defaultRoutes: Array<{ permission: PermissionKey; href: string }> = [
  { permission: "DASHBOARD", href: "/dashboard" },
  { permission: "MEMBERS", href: "/members" },
  { permission: "NEWS", href: "/news" },
  { permission: "POLICIES", href: "/policies" },
  { permission: "CONTACT_CASE", href: "/contact-case" },
  { permission: "PRODUCT_INTEREST", href: "/product-interest" },
  { permission: "ACCOUNTS", href: "/accounts" },
  { permission: "SETTINGS", href: "/settings" },
  { permission: "CONSENTS", href: "/consents" },
];

export function getProfilePermissions(profile: AdminUser): PermissionKey[] {
  return profile.role === "SUPER_ADMIN"
    ? ALL_PERMISSIONS
    : profile.roleRef?.permissions ?? [];
}

export function getRequiredPermission(pathname: string) {
  return routePermissions.find(({ prefix }) => matchesPath(pathname, prefix))
    ?.permission;
}

export function canAccessPath(
  pathname: string,
  permissions: PermissionKey[],
  isSuperAdmin: boolean
) {
  if (pathname === "/403") return true;
  if (pathname === "/activity-log") return isSuperAdmin;
  if (isSuperAdmin) return true;

  const requiredPermission = getRequiredPermission(pathname);
  return requiredPermission
    ? permissions.includes(requiredPermission)
    : true;
}

export function getDefaultRoute(
  permissions: PermissionKey[],
  isSuperAdmin: boolean
) {
  if (isSuperAdmin) return "/dashboard";
  return (
    defaultRoutes.find(({ permission }) => permissions.includes(permission))
      ?.href ?? "/403"
  );
}

function matchesPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
