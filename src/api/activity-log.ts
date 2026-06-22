import { apiClient } from "@/lib/apiClient";
import type {
  ActivityLogFilter,
  ActivityLogListParams,
  ActivityLogListResponse,
} from "@/types/activity-log";

export function buildActivityLogQuery(filter: ActivityLogFilter | ActivityLogListParams) {
  const params = new URLSearchParams();

  params.set("page", String(filter.page ?? 1));
  params.set("limit", String(filter.limit ?? 10));

  if (filter.entityType) params.set("entityType", filter.entityType);
  if (filter.entityId) params.set("entityId", filter.entityId);
  if (filter.action) params.set("action", filter.action);
  if (filter.adminId) params.set("adminId", filter.adminId);

  return params.toString();
}

export const activityLogApi = {
  getAll: async (
    params: ActivityLogListParams
  ): Promise<ActivityLogListResponse> => {
    const query = buildActivityLogQuery(params);
    const { data } = await apiClient.get<ActivityLogListResponse>(
      `/api/v1/admin/activity-logs?${query}`
    );
    return data;
  },
};
