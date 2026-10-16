import { apiClient } from "@/lib/apiClient";
import type {
  Member,
  MemberInsuranceResponse,
  MemberNotificationPreference,
  EditableMemberStatus,
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

interface MemberStatusResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    status: EditableMemberStatus;
  };
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

  updateStatus: async (
    id: string,
    status: EditableMemberStatus,
  ): Promise<MemberStatusResponse> => {
    const { data } = await apiClient.patch<MemberStatusResponse>(
      `/api/v1/admin/members/${id}/status`,
      { status },
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
