import { apiClient } from "@/lib/apiClient";
import type {
  ActivityLogListParams,
  ActivityLogListResponse,
} from "@/types/activity-log";

export const activityLogApi = {
  getAll: async (
    params: ActivityLogListParams
  ): Promise<ActivityLogListResponse> => {
    const { data } = await apiClient.get<ActivityLogListResponse>(
      "/api/v1/admin/activity-logs",
      { params }
    );
    return data;
  },
};
