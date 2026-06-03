import type { PaginationMeta } from "@/types/member";

export type ClaimRequestStatus = "READ" | "UNREAD";

export type ClaimRequestCategory =
  | "QUESTION"
  | "USAGE_PROBLEM"
  | "SUGGESTION"
  | "SERVICE_COMPLAINT";

export interface ClaimRequest {
  id: string;
  requestNo: string;
  phone: string;
  category: ClaimRequestCategory;
  title: string;
  submittedAt: string;
  status: ClaimRequestStatus;
  isToday: boolean;
}

export interface ClaimListParams {
  keyword?: string;
  category?: string;
  status?: string;
  dateRange?: string;
  page?: number;
  limit?: number;
}

export interface ClaimListResponse {
  success: boolean;
  data: ClaimRequest[];
  meta: PaginationMeta;
}

export interface ClaimStats {
  total: number;
  unread: number;
  read: number;
  today: number;
}
