export interface Product {
  id: string;
  categoryId: string;
  title: string;
  summary: string | null;
  content: string | null;
  mainImage: string | null;
  bannerImage: string | null;
  album: string[];
  coverages: string[];
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
  isPublish: boolean;
  isPinned: boolean;
  expiredAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  deletedAt: string | null;
  category?: { id: string; name: string };
}

export interface CreateProductPayload {
  categoryId: string;
  title: string;
  summary?: string;
  content?: string;
  mainImage?: string;
  bannerImage?: string;
  album?: string[];
  coverages?: string[];
  isPublish?: boolean;
  isPinned?: boolean;
  expiredAt?: string;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;
