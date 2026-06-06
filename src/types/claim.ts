import type { PaginationMeta } from "@/types/member";

export type ClaimRequestStatus = "READ" | "UNREAD";
export type ClaimCaseStatus = "NEW" | "IN_PROGRESS" | "CLOSED";

export interface ContactCategory {
  id: string;
  name: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClaimRequest {
  id: string;
  caseNo: string;
  userId: string;
  contactPhone: string;
  contactName: string | null;
  contactEmail: string | null;
  categoryId: string | null;
  category: Pick<ContactCategory, "id" | "name"> | null;
  subject: string;
  message: string | null;
  readStatus: ClaimRequestStatus;
  caseStatus: ClaimCaseStatus;
  submittedAt: string;
  readAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ClaimListParams {
  keyword?: string;
  categoryId?: string;
  readStatus?: string;
  caseStatus?: string;
  submittedFrom?: string;
  submittedTo?: string;
  page?: number;
  limit?: number;
}

export interface ClaimListResponse {
  data: ClaimRequest[];
  meta: PaginationMeta;
}

export interface ClaimStats {
  total: number;
  unread: number;
  read: number;
  today: number;
}
