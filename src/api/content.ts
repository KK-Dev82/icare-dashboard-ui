import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/auth";
import type { Content, CreateContentPayload, UpdateContentPayload, ContentType } from "@/types/content";

interface ContentListParams {
  keyword?: string;
  type?: ContentType;
  status?: string;
  page?: number;
  limit?: number;
}

interface ContentListResponse {
  success: boolean;
  data: Content[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  requestId?: string;
}

export const contentApi = {
  getAll: async (params?: ContentListParams): Promise<ContentListResponse> => {
    const { data } = await apiClient.get<ContentListResponse>(
      "/api/v1/admin/content",
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Content>> => {
    const { data } = await apiClient.get<ApiResponse<Content>>(
      `/api/v1/admin/content/${id}`
    );
    return data;
  },

  create: async (payload: CreateContentPayload): Promise<ApiResponse<Content>> => {
    const { data } = await apiClient.post<ApiResponse<Content>>(
      "/api/v1/admin/content",
      payload
    );
    return data;
  },

  update: async (id: string, payload: UpdateContentPayload): Promise<ApiResponse<Content>> => {
    const { data } = await apiClient.patch<ApiResponse<Content>>(
      `/api/v1/admin/content/${id}`,
      payload
    );
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<Content>> => {
    const { data } = await apiClient.delete<ApiResponse<Content>>(
      `/api/v1/admin/content/${id}`
    );
    return data;
  },

  // Convenience: toggle publish via PATCH
  publish: async (id: string): Promise<ApiResponse<Content>> => {
    return contentApi.update(id, { isPublish: true });
  },

  unpublish: async (id: string): Promise<ApiResponse<Content>> => {
    return contentApi.update(id, { isPublish: false });
  },
};
