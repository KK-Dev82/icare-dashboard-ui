"use client";

import { useRef, useState } from "react";
import { CalendarDays, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type FcmConfigKey =
  | "type"
  | "projectId"
  | "clientEmail"
  | "privateKeyId"
  | "clientId"
  | "authProviderCertUrl"
  | "tokenUrl"
  | "universeDomain"
  | "clientCertUrl"
  | "privateKey";

const initialValues: Record<FcmConfigKey, string> = {
  type: "",
  projectId: "",
  clientEmail: "",
  privateKeyId: "",
  clientId: "",
  authProviderCertUrl: "",
  tokenUrl: "",
  universeDomain: "",
  clientCertUrl: "",
  privateKey: "",
};

const configFields: Array<{
  key: Exclude<FcmConfigKey, "privateKey">;
  label: string;
  placeholder: string;
  fullWidth?: boolean;
}> = [
  {
    key: "type",
    label: "Type",
    placeholder: "ประเภทบัญชีที่ใช้เชื่อมต่อ Firebase",
    fullWidth: true,
  },
  {
    key: "projectId",
    label: "Project ID",
    placeholder: "รหัสโปรเจกต์จาก Firebase",
  },
  {
    key: "clientEmail",
    label: "Client Email",
    placeholder: "อีเมลบัญชีบริการ (Service Account)",
  },
  {
    key: "privateKeyId",
    label: "Private Key ID",
    placeholder: "รหัสสำหรับระบุคีย์ส่วนตัว",
  },
  {
    key: "clientId",
    label: "Client ID",
    placeholder: "รหัสลูกค้า (Client ID)",
  },
  {
    key: "authProviderCertUrl",
    label: "Auth Provider X509 Cert URL",
    placeholder: "URL ของใบรับรอง X509 สำหรับผู้ให้บริการยืนยัน",
  },
  {
    key: "tokenUrl",
    label: "Token URL",
    placeholder: "URL สำหรับขอรับ Access Token",
  },
  {
    key: "universeDomain",
    label: "Universe Domain",
    placeholder: "โดเมนของบริการ (Universe Domain)",
  },
  {
    key: "clientCertUrl",
    label: "Client X509 Cert URL",
    placeholder: "URL ของใบรับรอง X509 สำหรับบัญชีบริการ",
  },
];

export function FcmConfigPanel() {
  const toast = useToast();
  const privateKeyMaskRef = useRef<HTMLPreElement>(null);
  const [values, setValues] = useState(initialValues);
  const [isEditing, setIsEditing] = useState(true);
  const [hasSavedConfig, setHasSavedConfig] = useState(false);

  const updateValue = (key: FcmConfigKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    const hasEmptyField = Object.values(values).some((value) => !value.trim());

    if (hasEmptyField) {
      toast.warning("กรุณากรอกข้อมูลการตั้งค่า FCM ให้ครบทุกช่อง");
      return;
    }

    setHasSavedConfig(true);
    setIsEditing(false);
    toast.success("บันทึกการตั้งค่า FCM สำเร็จ");
  };

  const handleEdit = () => {
    if (!hasSavedConfig) return;
    setIsEditing(true);
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="mb-8 flex flex-col gap-4 border-b border-[#EAEAEA] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[20px] font-bold leading-7 text-[#243333]">
              ตั้งค่า FCM Push Notification
            </h2>
            <p className="mt-1 max-w-[520px] text-[14px] leading-6 text-[#9CA3AF]">
              กำหนดข้อมูลการเชื่อมต่อ Firebase Cloud Messaging สำหรับส่งแจ้งเตือนผ่านแอปพลิเคชัน
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={handleEdit}
              disabled={isEditing || !hasSavedConfig}
              className="h-[42px] min-w-[112px] rounded-[6px] bg-[#FF944D] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#F48338] disabled:cursor-not-allowed disabled:opacity-60"
            >
              แก้ไข
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isEditing}
              className="h-[42px] min-w-[112px] rounded-[6px] bg-[#24A148] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#1E8E3E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              บันทึก
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          {configFields.map((field) => (
            <Input
              key={field.key}
              size="md"
              className={field.fullWidth ? "w-full md:col-span-2" : "w-full"}
              label={field.label}
              placeholder={field.placeholder}
              value={values[field.key]}
              disabled={!isEditing}
              onChange={(event) => updateValue(field.key, event.target.value)}
            />
          ))}

          <div className="relative md:col-span-2">
            <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[12px] font-bold text-[#243333]">
              Private Key
            </label>
            <div className="relative overflow-hidden rounded-[10px] border border-[#DCDCDC] bg-white transition-all hover:border-primary focus-within:border-primary">
              {values.privateKey && (
                <pre
                  ref={privateKeyMaskRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre-wrap break-all px-4 py-4 font-sans text-[14px] leading-6 text-[#565656]"
                >
                  {maskPrivateKey(values.privateKey)}
                </pre>
              )}
              <textarea
                rows={4}
                value={values.privateKey}
                disabled={!isEditing}
                placeholder={"-----BEGIN PRIVATE KEY-----\\n********************\\n-----END PRIVATE KEY-----"}
                onChange={(event) => updateValue("privateKey", event.target.value)}
                onScroll={(event) => {
                  if (!privateKeyMaskRef.current) return;
                  privateKeyMaskRef.current.scrollTop = event.currentTarget.scrollTop;
                  privateKeyMaskRef.current.scrollLeft = event.currentTarget.scrollLeft;
                }}
                className="relative w-full resize-none bg-transparent px-4 py-4 text-[14px] leading-6 text-transparent caret-[#565656] outline-none placeholder:text-[#B7B7B7] selection:bg-primary/20 disabled:cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-[12px] leading-5 text-[#B0B6B8]">
              คีย์ส่วนตัวสำหรับการยืนยันตัวตน (ระบบจะซ่อนค่าเพื่อความปลอดภัย)
            </p>
          </div>
        </div>
      </section>

      <aside className="rounded-[18px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] xl:sticky xl:top-[104px]">
        <div className="border-b border-[#EAEAEA] pb-4">
          <h2 className="text-[20px] font-bold leading-7 text-[#243333]">ข้อมูลการตั้งค่า</h2>
          <p className="mt-1 text-[14px] leading-6 text-[#9CA3AF]">
            แสดงสถานะและข้อมูลการอัปเดตล่าสุด
          </p>
        </div>

        <div className="mt-5 space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#CFF6F5] text-primary">
              <Link2 size={20} strokeWidth={2} />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-[#565656]">สถานะการเชื่อมต่อ</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#24A148]">
                <span className="h-2 w-2 rounded-full bg-[#24A148]" />
                เชื่อมต่อแล้ว
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#CFF6F5] text-primary">
              <CalendarDays size={20} strokeWidth={2} />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-[#565656]">อัปเดตล่าสุด</p>
              <p className="mt-0.5 text-[13px] text-[#9CA3AF]">16 พ.ค. 2569 14:35 น.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function maskPrivateKey(value: string) {
  return value
    .split("\n")
    .map((line) => "*".repeat(line.length))
    .join("\n");
}
