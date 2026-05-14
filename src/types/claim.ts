export type ClaimRequestStatus = "new" | "pending" | "approved" | "rejected";

export interface ClaimRequest {
  id: number;
  name: string;
  policyNo: string;
  status: ClaimRequestStatus;
}
