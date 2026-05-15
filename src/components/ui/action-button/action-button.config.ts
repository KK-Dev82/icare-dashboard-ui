export type ActionIconButtonVariant = "primary" | "accent" | "danger" | "success";

export const actionIconButtonConfig: Record<
  ActionIconButtonVariant,
  { bg: string; text: string; label: string }
> = {
  primary: { bg: "#07A2A2", text: "#FFFFFF", label: "ดูรายละเอียด" },
  accent: { bg: "#FF944D", text: "#FFFFFF", label: "แก้ไข" },
  danger: { bg: "#F44034", text: "#FFFFFF", label: "ปิดการใช้งาน" },
  success: { bg: "#24A148", text: "#FFFFFF", label: "เปิดการใช้งาน" },
};
