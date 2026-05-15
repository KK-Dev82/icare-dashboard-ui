export interface PolicyCategory {
  id: string;
  name: string;
  description: string | null;
  bannerImage: string | null;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePolicyCategoryPayload {
  name: string;
  description?: string;
  bannerImage?: string;
  icon?: string;
}

export type UpdatePolicyCategoryPayload = Partial<CreatePolicyCategoryPayload>;
