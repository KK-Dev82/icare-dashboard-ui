export interface ContentCategory {
  id: string;
  name: string;
  description: string | null;
  bannerImage: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentCategoryPayload {
  name: string;
  description?: string;
  bannerImage?: string;
}

export type UpdateContentCategoryPayload = Partial<CreateContentCategoryPayload>;
