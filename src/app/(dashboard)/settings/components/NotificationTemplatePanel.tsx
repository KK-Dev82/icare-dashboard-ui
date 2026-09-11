"use client";

import { useState } from "react";
import newsInsuranceUpdateImage from "@/../assets/news-insurance-update.png";
import productPersonalAccidentImage from "@/../assets/product-personal-accident.png";
import promotionCityImage from "@/../assets/promotion-city.png";
import {
  NotificationPreviewCard,
  type NotificationPreviewContent,
  type NotificationPreviewPlatform,
} from "@/components/notification/NotificationPreviewCard";

type NotificationTemplateKey =
  | "policy-renewal"
  | "claim-status"
  | "claim-approved"
  | "product"
  | "promotion"
  | "news"
  | "system";

interface NotificationTemplateConfig {
  key: NotificationTemplateKey;
  label: string;
  description: string;
  previewTitle: string;
  content: NotificationPreviewContent;
}

const notificationTemplates: NotificationTemplateConfig[] = [
  {
    key: "policy-renewal",
    label: "ต่ออายุกรมธรรม์",
    description: "หลายบรรทัด มีลิงก์",
    previewTitle: "ต่ออายุกรมธรรม์",
    content: {
      title: "📄 แจ้งเตือนต่ออายุกรมธรรม์",
      reference: "กรมธรรม์เลขที่ POL-2568-001234",
      details: [
        { icon: "📅", text: "หมดอายุ 15 ก.ย. 2569" },
        { icon: "⏰", text: "เหลืออีก 30 วัน" },
      ],
    },
  },
  {
    key: "claim-status",
    label: "อัปเดตสถานะเคลม",
    description: "มีลิงก์",
    previewTitle: "อัปเดตสถานะเคลม",
    content: {
      title: "🔔 อัปเดตสถานะเคลม",
      reference: "คำร้องเคลม CLM-2570-040 อยู่ระหว่างพิจารณา",
    },
  },
  {
    key: "claim-approved",
    label: "เคลมอนุมัติ",
    description: "หลายบรรทัด มีลิงก์",
    previewTitle: "เคลมอนุมัติ",
    content: {
      title: "✅ เคลมของคุณได้รับการอนุมัติแล้ว",
      reference: "เลขที่ CLM-2570-040",
      details: [
        { icon: "💰", text: "โอนเงิน 12,500 บาท" },
        { icon: "🏦", text: "ภายใน 3 วันทำการ" },
      ],
    },
  },
  {
    key: "product",
    label: "ผลิตภัณฑ์",
    description: "มีรูป หลายบรรทัด มีลิงก์",
    previewTitle: "ผลิตภัณฑ์",
    content: {
      title: "📦 ผลิตภัณฑ์แนะนำสำหรับคุณ",
      reference: "แผนประกันอุบัติเหตุ คุ้มครองครบ จ่ายเบี้ยสบาย",
      details: [
        { icon: "▸", text: "แผนประกันอุบัติเหตุ" },
      ],
      image: productPersonalAccidentImage,
      imageAlt: "ผู้หญิงกำลังโทรศัพท์อยู่ข้างรถยนต์",
      imageBadge: "ประกันอุบัติเหตุ (Personal Accident)",
    },
  },
  {
    key: "promotion",
    label: "โปรโมชั่น",
    description: "มีรูป หลายบรรทัด มีลิงก์",
    previewTitle: "โปรโมชั่น",
    content: {
      title: "🎁 โปรโมชั่นใหม่สำหรับคุณ",
      reference: "ส่วนลดเบี้ยประกันสูงสุด 15%",
      previousValue: "เดิม 10%",
      details: [
        { icon: "▸", text: "แผนประกันอุบัติเหตุ" },
        { icon: "▸", text: "ถึง 30 ก.ย. 2569" },
      ],
      image: promotionCityImage,
      imageAlt: "อาคารสำนักงานในเมือง",
    },
  },
  {
    key: "news",
    label: "ข่าวสาร",
    description: "มีรูป มีลิงก์",
    previewTitle: "ข่าวสาร",
    content: {
      title: "📰 ข่าวสารจาก ICI Insurance",
      compactBody:
        "อัปเดตบริการและข้อมูลสำคัญสำหรับผู้เอาประกัน ติดตามข่าวสาร สิทธิประโยชน์ และข้อมูลด้านประกันภัยที่เป็นประโยชน์สำหรับคุณ",
      reference: "อัปเดตบริการและข้อมูลสำคัญสำหรับผู้เอาประกัน",
      details: [
        {
          text: "ติดตามข่าวสาร สิทธิประโยชน์ และข้อมูลด้านประกันภัยที่เป็นประโยชน์สำหรับคุณ",
        },
      ],
      image: newsInsuranceUpdateImage,
      imageAlt: "โต๊ะประชุมพร้อมเอกสารและแก้วกาแฟ",
    },
  },
  {
    key: "system",
    label: "แจ้งเตือนระบบ",
    description: "ไม่มีลิงก์",
    previewTitle: "แจ้งเตือนระบบ",
    content: {
      title: "⚠️ แจ้งปิดปรับปรุงระบบชั่วคราว",
      reference: "15 ส.ค. 2569 เวลา 01:00–03:00 น.",
    },
  },
];

const platforms: Array<{
  key: NotificationPreviewPlatform;
  label: string;
}> = [
  { key: "android", label: "Android - แถบแจ้งเตือน" },
  { key: "ios", label: "iPhone - แถบแจ้งเตือน" },
  { key: "in-app", label: "แบนเนอร์ในแอป - ตอนเปิดแอปอยู่" },
];

export function NotificationTemplatePanel() {
  const [activeTemplateKey, setActiveTemplateKey] =
    useState<NotificationTemplateKey>("claim-status");
  const activeTemplate =
    notificationTemplates.find((template) => template.key === activeTemplateKey) ??
    notificationTemplates[0];

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[735px_395px]">
      <section className="min-w-0 rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="border-b border-[#EAEAEA] pb-5">
        <h2 className="text-lg font-bold text-[#243333]">Template Notification</h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          แสดงภาพตัวอย่างของรูปภาพและข้อความแต่ละ Template บน Notification
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {notificationTemplates.map((template) => {
            const isActive = template.key === activeTemplate.key;

            return (
              <button
                key={template.key}
                type="button"
                onClick={() => setActiveTemplateKey(template.key)}
                aria-pressed={isActive}
                className={`min-h-[62px] rounded-[10px] border px-4 py-2.5 text-left transition-colors ${
                  isActive
                    ? "border-primary bg-[#DDF7F7]"
                    : "border-[#D7DCDE] bg-white hover:border-primary/60 hover:bg-primary/5"
                }`}
              >
                <span className="block text-sm font-bold text-[#243333]">
                  {template.label}
                </span>
                <span
                  className={`mt-0.5 block truncate text-[10px] ${
                    isActive ? "text-primary" : "text-[#B0B6B8]"
                  }`}
                >
                  {template.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-5">
        <div className="border-b border-[#EAEAEA] pb-5">
          <h3 className="text-base font-bold text-[#243333]">ตัวอย่าง</h3>
          <p className="mt-1 text-sm text-[#9CA3AF]">การแสดงผลของแบนเนอร์</p>
        </div>

        <div>
          {platforms.map((platform) => (
            <div
              key={platform.key}
              className="border-b border-[#EAEAEA] py-6 last:border-b-0"
            >
              <h4 className="mb-4 text-sm font-bold text-[#243333]">
                {platform.label} - {activeTemplate.previewTitle}
              </h4>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <PreviewItem label="แบบย่อ">
                  <NotificationPreviewCard
                    platform={platform.key}
                    content={activeTemplate.content}
                  />
                </PreviewItem>
                <PreviewItem
                  label="แบบขยาย"
                  stretchCard={!activeTemplate.content.image}
                >
                  <NotificationPreviewCard
                    platform={platform.key}
                    content={
                      activeTemplate.content.image
                        ? activeTemplate.content
                        : undefined
                    }
                    variant="expanded"
                    expandToContent
                  />
                </PreviewItem>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#EAEAEA] pt-5 text-sm leading-5 text-[#9CA3AF]">
          <p>
            • ทั้งสามกล่องใช้ข้อความ
            <strong className="text-[#243333]">ชุดเดียวกัน</strong>
            {" - Android/iOS แต่งข้อความบนแถบแจ้งเตือนไม่ได้ ตัวหนา/ขีดฆ่าที่เห็นคือ"}
            <strong className="text-[#243333]">ตัวอักษร</strong>
            {" จึงผ่านได้ทุกที่"}
          </p>
          <p>
            • เวลา ชื่อแอป และไอคอน วาดคร่าว ๆ พอให้เทียบ ของจริงขึ้นกับรุ่นและธีมของเครื่อง
          </p>
        </div>
      </div>
      </section>
      <BannerAnatomyPanel />
    </div>
  );
}

function PreviewItem({
  label,
  children,
  stretchCard = false,
}: {
  label: string;
  children: React.ReactNode;
  stretchCard?: boolean;
}) {
  return (
    <div className={stretchCard ? "flex min-w-0 flex-col" : "min-w-0"}>
      <div className={stretchCard ? "min-h-0 flex-1" : undefined}>
        {children}
      </div>
      <p className="mt-2 text-center text-xs text-[#AEB4B7]">{label}</p>
    </div>
  );
}

const bannerParts = [
  {
    marker: "ก",
    color: "border-[#8854FF] text-[#8854FF]",
    title: "โลโก้แอป",
    description:
      "ฝังอยู่ในแอป ส่งจาก backend ไม่ได้ และเห็นเฉพาะแบบแบนเนอร์ในแอป (แถบแจ้งเตือนใช้ไอคอนแอปแทน)",
  },
  {
    marker: "ข",
    color: "border-[#00A7E1] text-[#00A7E1]",
    title: "หัวข้อ",
    description: "backend ส่งมา เป็นข้อความล้วน แต่ใส่ emoji ได้",
  },
  {
    marker: "ค",
    color: "border-[#13B981] text-[#13B981]",
    title: "เนื้อความ",
    description:
      "backend ส่งมา ขึ้นบรรทัดใหม่ได้ โดยแบบย่อแสดงเนื้อความสูงสุด 4 บรรทัด และแบบขยายจะแสดงครบ",
  },
  {
    marker: "ง",
    color: "border-[#FF9418] text-[#FF9418]",
    title: "รูปประกอบ",
    description: "ไม่ใส่ก็ได้ ย่อคือรูปเล็กมุมขวา ขยายคือรูปเต็ม",
  },
  {
    marker: "จ",
    color: "border-[#FF3D8D] text-[#FF3D8D]",
    title: "ปลายทางเมื่อกด",
    description: "มองไม่เห็น แต่กำหนดว่ากดแล้วเปิดหน้าไหนในแอป",
  },
];

function BannerAnatomyPanel() {
  return (
    <aside className="rounded-[18px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] xl:sticky xl:top-[104px]">
      <div className="border-b border-[#EAEAEA] pb-4">
        <h3 className="text-[20px] font-bold leading-7 text-[#243333]">
          ส่วนประกอบของแบนเนอร์
        </h3>
        <p className="mt-1 text-[16px] leading-6 text-[#9CA3AF]">
          แสดงส่วนประกอบของแบนเนอร์ Notification
        </p>
      </div>

      <div className="mt-4 rounded-[12px] border border-[#DDE3E5] bg-[#EDF2F3] p-3">
        <div className="rounded-[11px] border border-[#E3E7E8] bg-white px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <BannerPlaceholder marker="ก" markerClassName="border-[#8854FF] text-[#8854FF]" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5">
                <BannerMarker marker="ข" className="border-[#00A7E1] text-[#00A7E1]" />
                <div className="h-2.5 w-[70%] rounded-full bg-[#E8EDEE]" />
              </div>
              <div className="flex items-center gap-1.5">
                <BannerMarker marker="ค" className="border-[#13B981] text-[#13B981]" />
                <div className="h-2.5 w-[86%] rounded-full bg-[#E8EDEE]" />
              </div>
            </div>
            <BannerPlaceholder marker="ง" markerClassName="border-[#FF9418] text-[#FF9418]" />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 px-2 text-[14px] leading-6 text-[#A8B0B3]">
          <BannerMarker marker="จ" className="border-[#FF3D8D] text-[#FF3D8D]" />
          <span>กดตรงไหนก็ได้บนแบนเนอร์</span>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {bannerParts.map((part) => (
          <div key={part.marker} className="flex items-start gap-3">
            <BannerMarker marker={part.marker} className={part.color} />
            <p className="min-w-0 text-[14px] leading-[22px] text-[#9CA3AF]">
              <strong className="text-[16px] font-bold text-[#243333]">{part.title}</strong>
              {" – "}
              {part.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-[#EAEAEA] pt-4 text-[14px] leading-[22px] text-[#9CA3AF]">
        <p>
          • ชื่อแอป เวลา และไอคอนเล็ก <strong className="font-bold text-[#243333]">ระบบใส่ให้เอง</strong> เราสั่งไม่ได้
        </p>
        <p>
          • ลำดับและระยะห่าง <strong className="font-bold text-[#243333]">ขึ้นกับระบบปฏิบัติการ</strong> เราคุมได้แค่แบนเนอร์ในแอป
        </p>
        <p>
          • ตัวหนา/ขีดฆ่าที่ใช้เป็น <strong className="font-bold text-[#243333]">ตัวอักษร Unicode</strong> ไม่ใช่การจัดรูปแบบ จึงผ่านได้ทุกที่ แต่โปรแกรมอ่านหน้าจอจะอ่านออกเสียงเพี้ยนได้เท่าที่จำเป็น
        </p>
      </div>
    </aside>
  );
}

function BannerMarker({
  marker,
  className,
}: {
  marker: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-white text-[12px] font-medium leading-none ${className}`}
    >
      {marker}
    </span>
  );
}

function BannerPlaceholder({
  marker,
  markerClassName,
}: {
  marker: string;
  markerClassName: string;
}) {
  return (
    <span className="inline-flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[7px] bg-[#EDF2F3]">
      <BannerMarker marker={marker} className={markerClassName} />
    </span>
  );
}
