import type { PaginationMeta } from "@/types/member";

export type ActivityLogEntityType = "CONTENT" | "PRODUCT";

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
  action?: string | null;
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

export interface ActivityLogListParams {
  entityType: ActivityLogEntityType;
  entityId: string;
  page?: number;
  limit?: number;
}

export interface ActivityLogListResponse {
  data: ActivityLog[];
  meta: PaginationMeta;
  requestId?: string;
  success?: boolean;
}
