import type { PermissionKey, UserType } from "@/types/user-type";

export const USER_TYPE_STORAGE_KEY = "icare-admin-user-types";

export const permissionOptions: { value: PermissionKey; label: string }[] = [
  { value: "DASHBOARD", label: "Dashboard" },
  { value: "MEMBERS", label: "สมาชิก" },
  { value: "NEWS", label: "ข่าวสาร / โปรโมชั่น" },
  { value: "POLICIES", label: "จัดการผลิตภัณฑ์" },
  { value: "CONTACT_CASE", label: "คำร้องขอติดต่อ" },
  { value: "PRODUCT_INTEREST", label: "ความสนใจผลิตภัณฑ์/คอนเทนต์" },
  { value: "ACCOUNTS", label: "ผู้ใช้งาน" },
  { value: "USER_TYPES", label: "ประเภทผู้ใช้งาน" },
  { value: "ACTIVITY_LOG", label: "ประวัติการใช้งาน" },
  { value: "SETTINGS", label: "การตั้งค่า" },
  { value: "CONSENTS", label: "การยินยอม" },
];

const now = "2026-01-01T00:00:00.000Z";

export const defaultUserTypes: UserType[] = [
  {
    id: "super-admin",
    code: "SUPER_ADMIN",
    name: "Super Admin",
    permissions: permissionOptions.map((permission) => permission.value),
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "admin",
    code: "ADMIN",
    name: "Admin",
    permissions: [
      "DASHBOARD",
      "MEMBERS",
      "NEWS",
      "POLICIES",
      "CONTACT_CASE",
      "PRODUCT_INTEREST",
      "ACCOUNTS",
      "USER_TYPES",
      "SETTINGS",
      "CONSENTS",
    ],
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "content-editor",
    code: "CONTENT_EDITOR",
    name: "Content Editor",
    permissions: ["DASHBOARD", "NEWS", "POLICIES"],
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  },
];

export function getStoredUserTypes() {
  if (typeof window === "undefined") return cloneDefaultUserTypes();

  const storedValue = window.localStorage.getItem(USER_TYPE_STORAGE_KEY);
  if (!storedValue) return cloneDefaultUserTypes();

  try {
    const parsed = JSON.parse(storedValue) as unknown;
    return isUserTypeList(parsed) ? parsed : cloneDefaultUserTypes();
  } catch {
    return cloneDefaultUserTypes();
  }
}

export function saveStoredUserTypes(userTypes: UserType[]) {
  window.localStorage.setItem(USER_TYPE_STORAGE_KEY, JSON.stringify(userTypes));
}

export function createUserTypeCode(name: string, existingCodes: string[]) {
  const baseCode = name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase() || "CUSTOM_ROLE";

  let code = baseCode;
  let suffix = 2;
  while (existingCodes.includes(code)) {
    code = `${baseCode}_${suffix}`;
    suffix += 1;
  }

  return code;
}

function cloneDefaultUserTypes() {
  return defaultUserTypes.map((userType) => ({
    ...userType,
    permissions: [...userType.permissions],
  }));
}

function isUserTypeList(value: unknown): value is UserType[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Partial<UserType>;
    return (
      typeof candidate.id === "string" &&
      typeof candidate.code === "string" &&
      typeof candidate.name === "string" &&
      Array.isArray(candidate.permissions) &&
      (candidate.status === "ACTIVE" || candidate.status === "INACTIVE")
    );
  });
}

