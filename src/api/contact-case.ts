import { apiClient } from "@/lib/apiClient";
import type {
  ContactCase,
  ContactCaseListParams,
  ContactCaseListResponse,
  ContactCaseStats,
  ContactCategory,
  ContactCaseStatus,
} from "@/types/contact-case";

interface ApiResponse<T> {
  data: T;
}

export const contactCaseApi = {
  getAll: async (params?: ContactCaseListParams): Promise<ContactCaseListResponse> => {
    const { data } = await apiClient.get<ContactCaseListResponse>(
      "/api/v1/admin/contact-cases",
      { params }
    );
    return data;
  },

  getStats: async (): Promise<ContactCaseStats> => {
    const { data } = await apiClient.get<ApiResponse<ContactCaseStats>>(
      "/api/v1/admin/contact-cases/summary"
    );
    return data.data;
  },

  getById: async (id: string): Promise<ContactCase> => {
    const { data } = await apiClient.get<ApiResponse<ContactCase>>(
      `/api/v1/admin/contact-cases/${id}`
    );
    return data.data;
  },

  markRead: async (id: string): Promise<ContactCase> => {
    const { data } = await apiClient.patch<ApiResponse<ContactCase>>(
      `/api/v1/admin/contact-cases/${id}/read`
    );
    return data.data;
  },

  updateStatus: async (id: string, status: ContactCaseStatus): Promise<ContactCase> => {
    const { data } = await apiClient.patch<ApiResponse<ContactCase>>(
      `/api/v1/admin/contact-cases/${id}/status`,
      { status }
    );
    return data.data;
  },

  delete: async (id: string): Promise<ContactCase> => {
    const { data } = await apiClient.delete<ApiResponse<ContactCase>>(
      `/api/v1/admin/contact-cases/${id}`
    );
    return data.data;
  },

  getCategories: async (): Promise<ContactCategory[]> => {
    const { data } = await apiClient.get<ApiResponse<ContactCategory[]>>(
      "/api/v1/admin/contact-cases/categories/list"
    );
    return data.data;
  },

  createCategory: async (payload: {
    name: string;
    sortOrder?: number;
  }): Promise<ContactCategory> => {
    const { data } = await apiClient.post<ApiResponse<ContactCategory>>(
      "/api/v1/admin/contact-cases/categories",
      payload
    );
    return data.data;
  },

  updateCategory: async (
    id: string,
    payload: { name?: string; sortOrder?: number }
  ): Promise<ContactCategory> => {
    const { data } = await apiClient.patch<ApiResponse<ContactCategory>>(
      `/api/v1/admin/contact-cases/categories/${id}`,
      payload
    );
    return data.data;
  },

  deleteCategory: async (id: string): Promise<ContactCategory> => {
    const { data } = await apiClient.delete<ApiResponse<ContactCategory>>(
      `/api/v1/admin/contact-cases/categories/${id}`
    );
    return data.data;
  },
};
