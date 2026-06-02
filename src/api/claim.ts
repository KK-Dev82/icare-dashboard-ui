import { apiClient } from "@/lib/apiClient";
import type {
  ClaimListParams,
  ClaimListResponse,
  ClaimRequest,
  ClaimStats,
} from "@/types/claim";

import claimsData from "@/mock-data/claims.json";

const USE_MOCK = true;
const MOCK_DELAY_MS = 120;

const waitForMock = () =>
  new Promise((resolve) => {
    setTimeout(resolve, MOCK_DELAY_MS);
  });

const getMockClaims = () => claimsData as ClaimRequest[];

const filterMockClaims = (items: ClaimRequest[], params?: ClaimListParams) => {
  const keyword = params?.keyword?.trim().toLowerCase();

  return items.filter((item) => {
    const matchesKeyword =
      !keyword ||
      [item.requestNo, item.phone, item.title].some((value) =>
        value.toLowerCase().includes(keyword)
      );
    const matchesCategory = !params?.category || item.category === params.category;
    const matchesStatus = !params?.status || item.status === params.status;

    return matchesKeyword && matchesCategory && matchesStatus;
  });
};

export const claimApi = {
  getAll: async (params?: ClaimListParams): Promise<ClaimListResponse> => {
    if (USE_MOCK) {
      await waitForMock();

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const filtered = filterMockClaims(getMockClaims(), params);
      const pageStart = (page - 1) * limit;
      const data = filtered.slice(pageStart, pageStart + limit);

      return {
        success: true,
        data,
        meta: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        },
      };
    }

    const { data } = await apiClient.get<ClaimListResponse>(
      "/api/v1/admin/claims",
      { params }
    );
    return data;
  },

  getStats: async (): Promise<ClaimStats> => {
    if (USE_MOCK) {
      await waitForMock();

      const items = getMockClaims();

      return {
        total: items.length,
        unread: items.filter((item) => item.status === "UNREAD").length,
        read: items.filter((item) => item.status === "READ").length,
        today: items.filter((item) => item.isToday).length,
      };
    }

    const { data } = await apiClient.get<{ data: ClaimStats }>(
      "/api/v1/admin/claims/stats"
    );
    return data.data;
  },
};
