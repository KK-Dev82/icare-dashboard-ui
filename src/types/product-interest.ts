import type { PaginationMeta } from "@/types/member";

export type ProductInterestStatus = "PENDING" | "CONTACTED" | "CLOSED";

export interface ProductInterest {
  id: string;
  leadNo: string;
  userId: string;
  productId?: string | null;
  contentId?: string | null;
  fullName?: string | null;
  phone: string;
  email?: string | null;
  note?: string | null;
  status: ProductInterestStatus;
  contactedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  product?: {
    id: string;
    title: string;
    category?: {
      id: string;
      name: string;
    };
  } | null;
  content?: {
    id: string;
    title: string;
    category?: {
      id: string;
      name: string;
    };
  } | null;
}

export interface ProductInterestListParams {
  keyword?: string;
  productId?: string;
  type?: string;
  status?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  limit?: number;
}

export interface ProductInterestListResponse {
  data: ProductInterest[];
  meta: PaginationMeta;
  success?: boolean;
  message?: string;
}

export interface ProductInterestStats {
  total: number;
  pending: number;
  contacted: number;
  today: number;
}
