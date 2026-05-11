export type PolicyStatus = "ACTIVE" | "EXPIRED" | "NEAR_EXPIRE";

export const statusConfig: Record<
  PolicyStatus,
  { bg: string; text: string; label: string }
> = {
  ACTIVE: { bg: "#07A2A2", text: "#FFFFFF", label: "คุ้มครอง" },
  EXPIRED: { bg: "#F44034", text: "#FFFFFF", label: "หมดอายุ" },
  NEAR_EXPIRE: { bg: "#FF944D", text: "#FFFFFF", label: "ใกล้หมดอายุ" },
};
