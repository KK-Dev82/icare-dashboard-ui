import { apiClient } from "@/lib/apiClient";
import type { RenewalContact, SaveRenewalContactPayload } from "@/types/renewal-contact";

interface ApiResponse<T> {
  data: T;
}

export const renewalContactApi = {
  get: async (): Promise<RenewalContact | null> => {
    const { data } = await apiClient.get<ApiResponse<RenewalContact | null>>(
      "/api/v1/admin/renewal/contact"
    );
    return data.data;
  },

  save: async (payload: SaveRenewalContactPayload): Promise<RenewalContact> => {
    const { data } = await apiClient.post<ApiResponse<RenewalContact>>(
      "/api/v1/admin/renewal/contact",
      payload
    );
    return data.data;
  },
};
