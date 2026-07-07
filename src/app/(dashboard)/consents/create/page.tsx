"use client";

import { useRouter } from "next/navigation";
import { PageBackHeader } from "@/components/layout/PageBackHeader";
import { ConsentForm } from "../_components/ConsentForm";

export default function CreateConsentPage() {
  const router = useRouter();

  return (
    <div>
      <PageBackHeader
        title="เพิ่มความยินยอม / นโยบาย"
        description="สร้างความยินยอม / นโยบาย ในไม่กี่ขั้นตอน"
        onBack={() => router.back()}
      />
      <ConsentForm mode="create" />
    </div>
  );
}
