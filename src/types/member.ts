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
  effectiveOn: string;
  expireOn: string;
  premium: string;
  sumInsured: string;
  certificateNo: string;
  certificateDocument: string | null;
  insured: {
    fullName: string;
    telephone: string;
    email: string;
  };
  product: {
    name: string;
    type: string;
    categories: { id: number; name: string }[];
  };
  policies: MemberInsurancePolicy[];
  mobile?: {
    brand: string;
    model: string;
    imei: string;
    serial: string;
  };
  vehicle?: {
    brand: string;
    model: string;
    plateNo: string;
    year: string;
    color: string;
  };
}

export interface MemberInsuranceResponse {
  total: number;
  data: MemberInsuranceItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
