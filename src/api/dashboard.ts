import { apiClient } from "@/lib/apiClient";
import type { ContactCase, ContactCaseListParams } from "@/types/contact-case";
import type {
  DashboardContactCase,
  DashboardListResponse,
  DashboardMember,
  DashboardSummary,
} from "@/types/dashboard";
import type { AccountLevel, MemberStatus } from "@/types/member";

interface DashboardSummaryParams {
  startDate?: string;
  endDate?: string;
}

interface DashboardSummaryResponse {
  success: boolean;
  data: DashboardSummary;
}

export interface DashboardMemberListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  accountLevel?: AccountLevel;
  status?: MemberStatus;
  createdFrom?: string;
  createdTo?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const dashboardApi = {
  getSummary: async (params?: DashboardSummaryParams): Promise<DashboardSummaryResponse> => {
    const { data } = await apiClient.get<DashboardSummaryResponse>(
      "/api/v1/admin/dashboard/summary",
      { params }
    );
    return data;
  },

  getMembers: async (
    params?: DashboardMemberListParams
  ): Promise<DashboardListResponse<DashboardMember>> => {
    const { data } = await apiClient.get<DashboardListResponse<DashboardMember>>(
      "/api/v1/admin/dashboard/members",
      { params }
    );
    return data;
  },

  getContactCases: async (
    params?: ContactCaseListParams
  ): Promise<DashboardListResponse<DashboardContactCase>> => {
    const { data } = await apiClient.get<DashboardListResponse<DashboardContactCase>>(
      "/api/v1/admin/dashboard/contact-cases",
      { params }
    );
    return data;
  },

  getContactCaseById: async (id: string): Promise<ContactCase> => {
    const { data } = await apiClient.get<ApiResponse<ContactCase>>(
      `/api/v1/admin/dashboard/contact-cases/${id}`
    );
    return data.data;
  },

  markContactCaseRead: async (id: string): Promise<ContactCase> => {
    const { data } = await apiClient.patch<ApiResponse<ContactCase>>(
      `/api/v1/admin/dashboard/contact-cases/${id}/read`
    );
    return data.data;
  },
};
