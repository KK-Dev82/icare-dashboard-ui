import { apiClient } from "@/lib/apiClient";

export type NotificationType = "NEWS" | "POLICY" | "SYSTEM";
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
};
