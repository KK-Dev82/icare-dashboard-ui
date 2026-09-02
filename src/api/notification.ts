import { apiClient } from "@/lib/apiClient";
import type {
  NotificationBroadcastFilter,
  NotificationBroadcastListResponse,
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
  getBroadcasts: async (
    filter: NotificationBroadcastFilter,
  ): Promise<NotificationBroadcastListResponse> => {
    const params = new URLSearchParams({
      page: String(filter.page ?? 1),
      limit: String(filter.limit ?? 10),
    });

    if (filter.keyword) params.set("keyword", filter.keyword);
    if (filter.type) params.set("type", filter.type);
    if (filter.dateFrom) params.set("dateFrom", filter.dateFrom);
    if (filter.dateTo) params.set("dateTo", filter.dateTo);

    const { data } = await apiClient.get<NotificationBroadcastListResponse>(
      `/api/v1/admin/notifications/broadcasts?${params.toString()}`,
    );
    return data;
  },
};
