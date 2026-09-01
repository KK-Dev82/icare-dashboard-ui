import type { PaginationMeta } from "@/types/member";

export type NotificationBroadcastType = "NEWS" | "PRODUCT" | "SYSTEM";

export interface NotificationBroadcast {
  broadcastId: string;
  title: string;
  body: string;
  type: NotificationBroadcastType;
  deepLink: string | null;
  date: string;
  totalSent: number;
  totalFailed: number;
  totalRead: number;
  totalUnread: number;
}

export interface NotificationBroadcastFilter {
  keyword?: string;
  type?: NotificationBroadcastType;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
}

export interface NotificationBroadcastListResponse {
  success: boolean;
  message: string;
  data: NotificationBroadcast[];
  meta: PaginationMeta;
  requestId: string | null;
}
