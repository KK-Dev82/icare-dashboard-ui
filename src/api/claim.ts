import { apiClient } from "@/lib/apiClient";
import type { ClaimRequest } from "@/types/claim";

import claimsData from "@/mock-data/claims.json";

const USE_MOCK = true;

export const claimApi = {
  getClaims: async (): Promise<ClaimRequest[]> => {
    if (USE_MOCK) {
      return claimsData as ClaimRequest[];
    }

    const { data } = await apiClient.get("/claims");
    return data;
  },
};
