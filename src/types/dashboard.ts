import type { AccountLevel, MemberStatus, PaginationMeta } from "@/types/member";
import type {
  ContactCaseReadStatus,
  ContactCaseStatus,
  ContactCategory,
} from "@/types/contact-case";

export interface DashboardSummary {
  newMembers: number;
  newCases: number;
  activeProducts: number;
  activeContents: number;
  unreadCases: number;
}

export interface DashboardMember {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  accountLevel: AccountLevel;
  status: MemberStatus;
  createdAt: string;
}

export interface DashboardContactCase {
  id: string;
  caseNo: string;
  subject: string;
  contactName: string | null;
  contactPhone: string;
  caseStatus: ContactCaseStatus;
  readStatus: ContactCaseReadStatus;
  submittedAt: string;
  category: Pick<ContactCategory, "id" | "name"> | null;
}

export interface DashboardListResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}
