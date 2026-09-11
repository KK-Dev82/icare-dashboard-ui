import type { PermissionKey } from "@/types/user-type";

export const permissionOptions: { value: PermissionKey; label: string }[] = [
  { value: "DASHBOARD", label: "Dashboard" },
  { value: "MEMBERS", label: "สมาชิก" },
  { value: "NEWS", label: "ข่าวสาร / โปรโมชั่น" },
  { value: "POLICIES", label: "จัดการผลิตภัณฑ์" },
  { value: "CONTACT_CASE", label: "คำร้อง / ติดต่อ" },
  { value: "PRODUCT_INTEREST", label: "ความสนใจผลิตภัณฑ์" },
  { value: "ACCOUNTS", label: "ผู้ใช้งาน" },
  { value: "SETTINGS", label: "การตั้งค่า" },
  { value: "CONSENTS", label: "การยินยอม" },
  { value: "NOTIFICATIONS", label: "ประวัติการแจ้งเตือน" },
];
