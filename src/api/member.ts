import { apiClient } from "@/lib/apiClient";
import type {
  Member,
  MemberInsuranceResponse,
  MemberNotificationPreference,
  PaginationMeta,
} from "@/types/member";

interface MemberListParams {
  keyword?: string;
  accountLevel?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface MemberListResponse {
  success: boolean;
  data: Member[];
  meta: PaginationMeta;
}

interface MemberDetailResponse {
  success: boolean;
  data: Member;
}

interface MemberInsuranceApiResponse {
  success: boolean;
  data: MemberInsuranceResponse;
}

interface MemberNotificationPreferenceResponse {
  success: boolean;
  message?: string;
  data: MemberNotificationPreference | null;
  meta?: unknown;
  requestId?: string;
}

export const memberApi = {
  getAll: async (params?: MemberListParams): Promise<MemberListResponse> => {
    const { data } = await apiClient.get<MemberListResponse>(
      "/api/v1/admin/members",
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<MemberDetailResponse> => {
    const { data } = await apiClient.get<MemberDetailResponse>(
      `/api/v1/admin/members/${id}`
    );
    return data;
  },

  getInsurance: async (id: string): Promise<MemberInsuranceApiResponse> => {
    const { data } = await apiClient.get<MemberInsuranceApiResponse>(
      `/api/v1/admin/members/${id}/insurance`
    );
    return data;
  },

  getNotificationPreferences: async (
    userId: string,
  ): Promise<MemberNotificationPreferenceResponse> => {
    const { data } = await apiClient.get<MemberNotificationPreferenceResponse>(
      `/api/v1/admin/notifications/users/${userId}/preferences`
    );
    return data;
  },
};
