import { apiClient } from "@/lib/apiClient";
import type { NewsItem } from "@/types/news";
import newsData from "@/mock-data/news.json";

const USE_MOCK = true;

export const newsApi = {
  getNews: async (): Promise<NewsItem[]> => {
    if (USE_MOCK) {
      return newsData as NewsItem[];
    }
    const { data } = await apiClient.get("/api/v1/admin/news");
    return data.data;
  },
};
