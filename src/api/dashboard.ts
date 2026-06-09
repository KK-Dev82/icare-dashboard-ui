import { apiClient } from "@/lib/apiClient";
import type { DashboardSummary } from "@/types/dashboard";

interface DashboardSummaryParams {
  startDate?: string;
  endDate?: string;
}

interface DashboardSummaryResponse {
  success: boolean;
  data: DashboardSummary;
}

export const dashboardApi = {
  getSummary: async (params?: DashboardSummaryParams): Promise<DashboardSummaryResponse> => {
    const { data } = await apiClient.get<DashboardSummaryResponse>(
      "/api/v1/admin/dashboard/summary",
      { params }
    );
    return data;
  },
};
