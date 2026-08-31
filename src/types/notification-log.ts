import type { PaginationMeta } from "@/types/member";
import type { Product } from "@/types/product";

export type NotificationLogType = "NEWS" | "PRODUCT" | "SYSTEM";
export type NotificationLogAudience = "ALL" | "MEMBER" | "CUSTOMER";

export type NotificationLogStatus =
  | "SENT"
  | "SUCCESS"
  | "FAILED"
  | "PARTIAL"
  | "PENDING"
  | "SCHEDULED";

export interface NotificationLogSender {
  id?: string;
  username?: string | null;
  fullName?: string | null;
  name?: string | null;
  role?: string | null;
}

export interface NotificationLogPayload {
  title?: string | null;
  body?: string | null;
  bodyRich?: string | null;
  imageUrl?: string | null;
  contentId?: string | null;
  productId?: string | null;
}

export interface NotificationLog {
  id: string;
  title: string;
  body?: string | null;
  subtitle?: string | null;
  bodyRich?: string | null;
  imageUrl?: string | null;
  deepLink?: string | null;
  contentId?: string | null;
  productId?: string | null;
  product?: Product | null;
  data?: NotificationLogPayload | null;
  payload?: NotificationLogPayload | null;
  metadata?: NotificationLogPayload | null;
  type: NotificationLogType | string;
  audience?: NotificationLogAudience | string | null;
  total?: number | null;
  totalRecipients?: number | null;
  totalDevices?: number | null;
  targetCount?: number | null;
  recipientCount?: number | null;
  success?: number | null;
  successCount?: number | null;
  sentCount?: number | null;
  failed?: number | null;
  failedCount?: number | null;
  failureCount?: number | null;
  read?: number | null;
  readCount?: number | null;
  openedCount?: number | null;
  status?: NotificationLogStatus | string | null;
  senderName?: string | null;
  createdByName?: string | null;
  createdBy?: string | null;
  admin?: NotificationLogSender | null;
  sender?: NotificationLogSender | null;
  createdByAdmin?: NotificationLogSender | null;
  sentAt?: string | null;
  createdAt: string;
}

export interface NotificationLogFilter {
  search?: string;
  type?: NotificationLogType;
  status?: NotificationLogStatus;
  page: number;
  limit: number;
}

export interface NotificationLogListResponse {
  success?: boolean;
  data: NotificationLog[];
  meta?: PaginationMeta;
  requestId?: string;
}
