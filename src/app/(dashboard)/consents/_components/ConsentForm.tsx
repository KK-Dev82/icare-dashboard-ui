"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { consentApi } from "@/api/consent";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import type { ConsentPolicy, ConsentStatus, ConsentType } from "@/types/consent";
import { RichTextEditor } from "./RichTextEditor";

interface ConsentFormProps {
  mode: "create" | "edit";
  initialData?: ConsentPolicy;
}

type EditableConsentStatus = Extract<ConsentStatus, "DRAFT" | "PUBLISHED">;

const statusOptions: Array<{ label: string; value: EditableConsentStatus }> = [
  { label: "ร่าง", value: "DRAFT" },
  { label: "เผยแพร่", value: "PUBLISHED" },
];

const statusLabel: Record<ConsentStatus, string> = {
  DRAFT: "ร่าง",
  PUBLISHED: "เผยแพร่",
  ARCHIVED: "เก็บถาวร",
};

export function ConsentForm({ mode, initialData }: ConsentFormProps) {
  const router = useRouter();
  const toast = useToast();
  const toastRef = useRef(toast);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [types, setTypes] = useState<ConsentType[]>([]);
  const [typeId, setTypeId] = useState(initialData?.typeId ?? "");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [contentHtml, setContentHtml] = useState(initialData?.contentHtml ?? "");
  const [isRequired, setIsRequired] = useState(initialData?.isRequired ?? true);
  const [status, setStatus] = useState<EditableConsentStatus>(
    initialData?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
  );
  const [effectiveFrom, setEffectiveFrom] = useState(
    initialData?.effectiveFrom ? initialData.effectiveFrom.split("T")[0] : "",
  );
  const [effectiveTo, setEffectiveTo] = useState(
    initialData?.effectiveTo ? initialData.effectiveTo.split("T")[0] : "",
  );

  const canEdit = !initialData || initialData.status === "DRAFT";

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    let cancelled = false;

    consentApi
      .getTypes()
      .then((typeItems) => {
        if (!cancelled) setTypes(typeItems);
      })
      .catch((error) => {
        if (!cancelled) toastRef.current.fromError(error);
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isValid = useMemo(
    () =>
      Boolean(
        typeId &&
          title.trim() &&
          stripHtml(contentHtml).trim() &&
          contentHtml.trim() !== "<p></p>",
      ),
    [contentHtml, title, typeId],
  );

  const savePolicy = async () => {
    if (!isValid || !canEdit) return;
    setLoading(true);

    try {
      const payload = {
        typeId,
        title: title.trim(),
        description: description.trim() || undefined,
        contentHtml,
        isRequired,
        effectiveFrom: effectiveFrom || undefined,
        effectiveTo: effectiveTo || null,
      };

      const savedPolicy =
        mode === "edit" && initialData
          ? await consentApi.updatePolicy(initialData.id, payload)
          : await consentApi.createPolicy(payload);

      if (status === "PUBLISHED" && savedPolicy.status !== "PUBLISHED") {
        await consentApi.publishPolicy(savedPolicy.id);
      }

      toast.success(
        mode === "edit"
          ? "บันทึกความยินยอม / นโยบายสำเร็จ"
          : "เพิ่มความยินยอม / นโยบายสำเร็จ",
      );
      router.push("/consents");
    } catch (error) {
      toast.fromError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void savePolicy();
      }}
    >
      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#EAEAEA] p-8 space-y-6">
          {!canEdit && (
            <div className="rounded-[8px] border border-[#FF944D]/30 bg-[#FF944D]/5 px-4 py-3 text-sm text-[#FF944D]">
              รายการที่เผยแพร่หรือเก็บถาวรแล้วไม่สามารถแก้ไขได้
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <Select
              size="lg"
              className="w-full"
              label="ประเภท *"
              placeholder={loadingOptions ? "กำลังโหลด..." : "เลือกประเภท"}
              value={typeId}
              onChange={setTypeId}
              disabled={loadingOptions || !canEdit}
              options={types
                .filter((item) => item.isActive !== false)
                .map((item) => ({ label: item.name, value: item.id }))}
            />
            <Select
              size="lg"
              className="w-full"
              label="กำหนดข้อบังคับ"
              placeholder="เลือกข้อบังคับ"
              value={isRequired ? "true" : "false"}
              onChange={(value) => setIsRequired(value === "true")}
              disabled={!canEdit}
              options={[
                { label: "บังคับ", value: "true" },
                { label: "ไม่บังคับ", value: "false" },
              ]}
            />
          </div>

          <Input
            size="lg"
            className="w-full"
            label="หัวข้อแสดงบนแอป *"
            placeholder="กรอกหัวข้อแสดงบนแอป"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={!canEdit}
            required
          />

          <Input
            size="lg"
            className="w-full"
            label="คำอธิบาย"
            placeholder="กรอกคำอธิบาย"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={!canEdit}
          />

          <RichTextEditor
            label="รายละเอียดฉบับเต็ม *"
            value={contentHtml}
            onChange={setContentHtml}
            disabled={!canEdit}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#EAEAEA] p-6">
            <h3 className="text-sm font-bold text-[#243333] mb-4">การเผยแพร่</h3>
            <div className="space-y-4">
              {canEdit ? (
                <Select
                  size="md"
                  className="w-full"
                  label="สถานะ"
                  placeholder="เลือกสถานะ"
                  value={status}
                  onChange={(value) => setStatus(value as EditableConsentStatus)}
                  options={statusOptions}
                />
              ) : (
                <div className="rounded-[10px] border border-[#EAEAEA] px-4 py-3">
                  <p className="text-xs text-[#9CA3AF]">สถานะ</p>
                  <p className="mt-1 text-sm font-bold text-[#243333]">
                    {statusLabel[initialData?.status ?? "DRAFT"]}
                  </p>
                </div>
              )}

              {initialData?.version && (
                <div className="rounded-[10px] border border-[#EAEAEA] px-4 py-3">
                  <p className="text-xs text-[#9CA3AF]">เวอร์ชั่น</p>
                  <p className="mt-1 text-sm font-bold text-[#243333]">
                    {initialData.version}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#565656] mb-1.5">
                  วันที่เริ่มใช้งาน
                </label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(event) => setEffectiveFrom(event.target.value)}
                  disabled={!canEdit}
                  className="w-full h-[42px] px-4 rounded-[10px] border border-[#DCDCDC] text-sm text-[#565656] outline-none focus:border-primary transition-colors disabled:bg-gray-50 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#565656] mb-1.5">
                  วันที่สิ้นสุด
                </label>
                <input
                  type="date"
                  value={effectiveTo}
                  onChange={(event) => setEffectiveTo(event.target.value)}
                  disabled={!canEdit}
                  className="w-full h-[42px] px-4 rounded-[10px] border border-[#DCDCDC] text-sm text-[#565656] outline-none focus:border-primary transition-colors disabled:bg-gray-50 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="submit"
                disabled={loading || !isValid || !canEdit}
                className="h-[44px] rounded-[10px] bg-[#24A148] text-white text-sm font-medium hover:bg-[#1e8e3e] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => router.back()}
                className="h-[44px] rounded-[10px] bg-[#B7B7B7] text-white text-sm font-medium hover:bg-[#A8A8A8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
}
