"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageBackHeader } from "@/components/layout/PageBackHeader";
import { useBreadcrumbLabel } from "@/components/layout/BreadcrumbContext";
import { consentApi } from "@/api/consent";
import type { ConsentPolicy } from "@/types/consent";
import { ConsentForm } from "../../_components/ConsentForm";

export default function EditConsentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<ConsentPolicy | null>(null);
  const [fetching, setFetching] = useState(true);

  useBreadcrumbLabel(`/consents/edit/${id}`, item?.title ?? "");

  useEffect(() => {
    consentApi
      .getPolicyById(id)
      .then(setItem)
      .finally(() => setFetching(false));
  }, [id]);

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-sm text-[#9CA3AF]">กำลังโหลด...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-sm text-[#9CA3AF]">ไม่พบข้อมูล</span>
      </div>
    );
  }

  return (
    <div>
      <PageBackHeader
        title="แก้ไขความยินยอม / นโยบาย"
        description="แก้ไขรายละเอียดและการเผยแพร่"
        onBack={() => router.back()}
      />
      <ConsentForm mode="edit" initialData={item} />
    </div>
  );
}
