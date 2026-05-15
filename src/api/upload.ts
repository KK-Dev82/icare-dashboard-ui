import { apiClient } from "@/lib/apiClient";
import type { UploadResponse } from "@/types/upload";

export const uploadApi = {
  upload: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<UploadResponse>(
      "/api/v1/uploads",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },
};
