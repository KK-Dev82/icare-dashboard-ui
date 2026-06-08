import type { PaginationMeta } from "@/types/member";

export type ContactCaseReadStatus = "READ" | "UNREAD";
export type ContactCaseStatus = "NEW" | "IN_PROGRESS" | "CLOSED";

export interface ContactCategory {
  id: string;
  name: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactCase {
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
  readStatus: ContactCaseReadStatus;
  caseStatus: ContactCaseStatus;
  submittedAt: string;
  readAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ContactCaseListParams {
  keyword?: string;
  categoryId?: string;
  readStatus?: string;
  caseStatus?: string;
  submittedFrom?: string;
  submittedTo?: string;
  page?: number;
  limit?: number;
}

export interface ContactCaseListResponse {
  data: ContactCase[];
  meta: PaginationMeta;
}

export interface ContactCaseStats {
  total: number;
  unread: number;
  read: number;
  today: number;
}
