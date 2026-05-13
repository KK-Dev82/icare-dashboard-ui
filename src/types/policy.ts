export type PolicyStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface Policy {
  id: string;
  categoryId: string;
  policyNo: string;
  policyName: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  startDate: string | null;
  endDate: string | null;
  premiumAmount: string | null;
  sumInsured: string | null;
  serialNo: string | null;
  status: PolicyStatus;
  detailJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category?: { id: string; name: string };
  linkedUserCount?: number;
}

export interface CreatePolicyPayload {
  categoryId: string;
  policyNo: string;
  policyName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  startDate?: string;
  endDate?: string;
  premiumAmount?: number;
  sumInsured?: number;
  serialNo?: string;
  status?: PolicyStatus;
  detailJson?: Record<string, unknown>;
}

export type UpdatePolicyPayload = Partial<CreatePolicyPayload>;

export interface PolicyUser {
  id: string;
  userId: string;
  policyId: string;
  linkedBy: string;
  linkedAt: string;
  user: {
    id: string;
    phone: string;
    fullName: string;
    email: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
