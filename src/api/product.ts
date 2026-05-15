import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/auth";
import type { Product, CreateProductPayload, UpdateProductPayload } from "@/types/product";

interface ProductListParams {
  keyword?: string;
  categoryId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface ProductListResponse {
  success: boolean;
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  requestId?: string;
}

export const productApi = {
  getAll: async (params?: ProductListParams): Promise<ProductListResponse> => {
    const { data } = await apiClient.get<ProductListResponse>(
      "/api/v1/admin/products",
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const { data } = await apiClient.get<ApiResponse<Product>>(
      `/api/v1/admin/products/${id}`
    );
    return data;
  },

  create: async (payload: CreateProductPayload): Promise<ApiResponse<Product>> => {
    const { data } = await apiClient.post<ApiResponse<Product>>(
      "/api/v1/admin/products",
      payload
    );
    return data;
  },

  update: async (id: string, payload: UpdateProductPayload): Promise<ApiResponse<Product>> => {
    const { data } = await apiClient.patch<ApiResponse<Product>>(
      `/api/v1/admin/products/${id}`,
      payload
    );
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<Product>> => {
    const { data } = await apiClient.delete<ApiResponse<Product>>(
      `/api/v1/admin/products/${id}`
    );
    return data;
  },

  publish: async (id: string): Promise<ApiResponse<Product>> => {
    return productApi.update(id, { isPublish: true });
  },

  unpublish: async (id: string): Promise<ApiResponse<Product>> => {
    return productApi.update(id, { isPublish: false });
  },

};
