import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/auth";
import type { ContentCategory, CreateContentCategoryPayload, UpdateContentCategoryPayload } from "@/types/content-category";

export const contentCategoryApi = {
  getAll: async (): Promise<ApiResponse<ContentCategory[]>> => {
    const { data } = await apiClient.get<ApiResponse<ContentCategory[]>>(
      "/api/v1/admin/content-categories"
    );
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<ContentCategory>> => {
    const { data } = await apiClient.get<ApiResponse<ContentCategory>>(
      `/api/v1/admin/content-categories/${id}`
    );
    return data;
  },

  create: async (payload: CreateContentCategoryPayload): Promise<ApiResponse<ContentCategory>> => {
    const { data } = await apiClient.post<ApiResponse<ContentCategory>>(
      "/api/v1/admin/content-categories",
      payload
    );
    return data;
  },

  update: async (id: string, payload: UpdateContentCategoryPayload): Promise<ApiResponse<ContentCategory>> => {
    const { data } = await apiClient.patch<ApiResponse<ContentCategory>>(
      `/api/v1/admin/content-categories/${id}`,
      payload
    );
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<ContentCategory>> => {
    const { data } = await apiClient.delete<ApiResponse<ContentCategory>>(
      `/api/v1/admin/content-categories/${id}`
    );
    return data;
  },
};
