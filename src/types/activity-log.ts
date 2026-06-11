import type { PaginationMeta } from "@/types/member";

export type ActivityEntityType =
  | "PRODUCT"
  | "MEMBER"
  | "CONTENT"
  | "USER"
  | "SYSTEM";

export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "UNPUBLISH";

export type ActivityLogEntityType = ActivityEntityType;

export interface ActivityLogActor {
  id?: string;
  name?: string | null;
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
}

export interface ActivityLog {
  id: string;
  entityType: ActivityLogEntityType | string;
  entityId: string;
  action: ActivityAction | string;
  previousData?: Record<string, unknown> | null;
  changedData?: Record<string, unknown> | null;
  adminId?: string | null;
  adminName?: string | null;
  role?: string | null;
  event?: string | null;
  description?: string | null;
  message?: string | null;
  fieldName?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  changes?: Record<string, unknown> | null;
  actor?: ActivityLogActor | null;
  admin?: ActivityLogActor | null;
  user?: ActivityLogActor | null;
  actorName?: string | null;
  createdByName?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityLogFilter {
  search?: string;
  adminId?: string;
  entityId?: string;
  entityType?: ActivityEntityType;
  action?: ActivityAction;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

export interface ActivityLogListParams {
  search?: string;
  adminId?: string;
  entityType?: ActivityLogEntityType;
  action?: ActivityAction;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  entityId?: string;
}

export interface ActivityLogListResponse {
  data: ActivityLog[];
  meta: PaginationMeta;
  requestId?: string;
  success?: boolean;
}
