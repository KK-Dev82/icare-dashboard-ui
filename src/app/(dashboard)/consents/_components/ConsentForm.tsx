"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import { consentApi } from "@/api/consent";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/modal";
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
  const [useExternal, setUseExternal] = useState(false);
  const [loadingExternal, setLoadingExternal] = useState(false);

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

  const [confirmExternal, setConfirmExternal] = useState(false);

  const handleExternalToggle = async () => {
    if (!useExternal) {
      if (stripHtml(contentHtml).trim()) {
        setConfirmExternal(true);
        return;
      }
      await fetchExternalContent();
    } else {
      setUseExternal(false);
    }
  };

  const fetchExternalContent = async () => {
    setLoadingExternal(true);
    try {
      const res = await consentApi.getExternalPolicy();
      const content = res?.content ?? "";
      const html = content ? await marked(content) : "";
      setContentHtml(html);
      setUseExternal(true);
    } catch (err) {
      toast.fromError(err);
      setUseExternal(false);
    } finally {
      setLoadingExternal(false);
    }
  };

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

          {canEdit && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#243333]">ดึงข้อมูลจาก API ภายนอก</p>
                  <p className="text-xs text-[#9CA3AF]">เมื่อเปิดใช้งาน ระบบจะดึงข้อความ Consent จาก API มาแสดงในช่องรายละเอียดฉบับเต็ม</p>
                </div>
                <button
                  type="button"
                  onClick={handleExternalToggle}
                  disabled={loadingExternal}
                  className={`relative inline-flex h-[26px] w-[48px] shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                    useExternal ? "bg-primary" : "bg-[#DCDCDC]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-[20px] w-[20px] rounded-full bg-white shadow transform transition-transform mt-[3px] ${
                      useExternal ? "translate-x-[25px]" : "translate-x-[3px]"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

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

              {/* วันที่เริ่มใช้งาน - ซ่อนไว้ก่อน ยังไม่มีความจำเป็นต้องใช้ */}

              {/* วันที่สิ้นสุด - ซ่อนไว้ก่อน ยังไม่มีความจำเป็นต้องใช้ */}
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
      <ConfirmModal
        open={confirmExternal}
        title="ยืนยันการดึงเนื้อหา"
        message="ข้อมูลใน text editor จะถูกแทนที่ด้วยเนื้อหาจาก iCare ต้องการดำเนินการต่อใช่หรือไม่?"
        confirmLabel="ยืนยัน"
        confirmColor="danger"
        onConfirm={() => {
          setConfirmExternal(false);
          void fetchExternalContent();
        }}
        onCancel={() => setConfirmExternal(false)}
      />
    </form>
  );
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
}
