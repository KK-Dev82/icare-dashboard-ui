export type NewsStatus = "published" | "draft" | "inactive";

export interface NewsItem {
  id: number;
  title: string;
  category: string;
  image: string;
  publishDate: string;
  status: NewsStatus;
}
