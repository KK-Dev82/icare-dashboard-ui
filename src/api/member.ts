import { apiClient } from "@/lib/apiClient";
import type { Member, MemberDetail } from "@/types/member";

// Mock imports (ลบออกเมื่อมี API จริง)
import membersData from "@/mock-data/members.json";
import memberDetailData from "@/mock-data/member-detail.json";

const USE_MOCK = true; // เปลี่ยนเป็น false เมื่อมี API จริง

export const memberApi = {
  getMembers: async (): Promise<Member[]> => {
    if (USE_MOCK) {
      return membersData as Member[];
    }
    const { data } = await apiClient.get("/members");
    return data;
  },

  getMemberById: async (id: string): Promise<MemberDetail> => {
    if (USE_MOCK) {
      return memberDetailData as unknown as MemberDetail;
    }
    const { data } = await apiClient.get(`/members/${id}`);
    return data;
  },
};
