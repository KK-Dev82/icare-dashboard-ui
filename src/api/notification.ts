import { apiClient } from "@/lib/apiClient";
import type {
  NotificationLogFilter,
  NotificationLogListResponse,
} from "@/types/notification-log";

export type NotificationType = "NEWS" | "PRODUCT" | "SYSTEM";
export type NotificationAudience = "ALL" | "MEMBER" | "CUSTOMER";

export interface BroadcastPayload {
  title: string;
  body: string;
  type: NotificationType;
  subtitle?: string;
  imageUrl?: string;
  bodyRich?: string;
  deepLink?: string;
  contentId?: string;
  productId?: string;
  audience?: NotificationAudience;
  scheduledAt?: string;
}

export interface BroadcastResult {
  total: number;
  success: number;
  failed: number;
}

export interface BroadcastScheduledResult {
  scheduled: true;
  jobId: string;
  scheduledAt: string;
}

export const notificationApi = {
  broadcast: async (payload: BroadcastPayload): Promise<BroadcastResult | BroadcastScheduledResult> => {
    const { data } = await apiClient.post<{ success: boolean; data: BroadcastResult | BroadcastScheduledResult }>(
      "/api/v1/admin/notifications/broadcast",
      payload,
    );
    return data.data;
  },
  getLogs: async (filter: NotificationLogFilter): Promise<NotificationLogListResponse> => {
    const params = new URLSearchParams({
      page: String(filter.page ?? 1),
      limit: String(filter.limit ?? 10),
    });

    if (filter.search) params.set("keyword", filter.search);
    if (filter.type) params.set("type", filter.type);
    if (filter.status) params.set("status", filter.status);

    const { data } = await apiClient.get<NotificationLogListResponse>(
      `/api/v1/admin/notifications/logs?${params.toString()}`,
    );
    return data;
  },
};
