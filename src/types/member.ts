import type { PolicyStatus } from "@/components/ui/card";

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  hasPolicy: boolean;
  isActive: boolean;
}

export interface MemberDetail {
  id: number;
  memberId: string;
  name: string;
  email: string;
  phone: string;
  registerDate: string;
  status: string;
  hasPolicy: boolean;
  policySummary: {
    total: number;
    active: number;
    nearExpire: number;
    expired: number;
  };
  policies: PolicyItem[];
  claims: ClaimItem[];
}

export interface PolicyItem {
  no: string;
  status: PolicyStatus;
  type: string;
  period: string;
  insured: string;
  plate: string;
}

export interface ClaimItem {
  id: string;
  policyNo: string;
  status: "pending" | "success";
  submitDate: string;
}
