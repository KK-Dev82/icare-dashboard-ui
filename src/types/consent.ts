export type ConsentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ConsentType {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ConsentScene {
  slug: string;
  name: string;
}

export interface ConsentPolicy {
  id: string;
  typeId: string;
  type?: ConsentType;
  scene: string | null;
  title: string;
  description: string | null;
  summary: string | null;
  contentHtml: string;
  isRequired: boolean;
  requireReconsent: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  pdfUrl: string | null;
  version: string;
  status: ConsentStatus;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentUserAcceptance {
  user: {
    id: string;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  policy: {
    id: string;
    title: string;
    version: string;
  };
  acceptedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface CreateConsentPolicyPayload {
  typeId: string;
  scene?: string;
  title: string;
  description?: string;
  summary?: string;
  contentHtml: string;
  isRequired?: boolean;
  requireReconsent?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  pdfUrl?: string | null;
}

export type UpdateConsentPolicyPayload = Partial<CreateConsentPolicyPayload>;

export interface CreateConsentTypePayload {
  name: string;
  slug: string;
}

export interface UpdateConsentTypePayload extends Partial<CreateConsentTypePayload> {
  isActive?: boolean;
  sortOrder?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
