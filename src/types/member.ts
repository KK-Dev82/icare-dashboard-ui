export type AccountLevel = "MEMBER" | "CUSTOMER";
export type MemberStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface Member {
  id: string;
  phone: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  accountLevel: AccountLevel;
  status: MemberStatus;
  isPhoneVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface MemberInsurancePolicy {
  id: number;
  no: string;
  documentUrl: string;
}

export interface MemberInsuranceItem {
  id: number;
  status: string;
  productName: string;
  effectiveOn: string;
  expireOn: string;
  claimable: boolean;
  sumInsured: number;
  brand: string;
  model: string;
  type: string;
  subModel: string;
  imei: string;
  serial: string;
  renewal: unknown;
}

export interface MemberInsuranceResponse {
  data: MemberInsuranceItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
