export type ContentType = "NEWS" | "PROMOTION";
export type ContentStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  summary: string | null;
  content: string | null;
  mainImage: string | null;
  bannerImage: string | null;
  album: string[];
  status: ContentStatus;
  isPublish: boolean;
  sortOrder: number;
  isPinned: boolean;
  expiredAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  deletedAt: string | null;
}

export interface CreateContentPayload {
  type?: ContentType;
  title: string;
  summary?: string;
  content?: string;
  mainImage?: string;
  bannerImage?: string;
  album?: string[];
  isPinned?: boolean;
  sortOrder?: number;
  isPublish?: boolean;
  expiredAt?: string; // YYYY-MM-DD
}

export type UpdateContentPayload = Partial<CreateContentPayload>;
