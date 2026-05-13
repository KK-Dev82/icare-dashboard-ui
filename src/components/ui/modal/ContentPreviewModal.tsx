"use client";

import { X, Pin } from "lucide-react";
import type { Content, ContentStatus, ContentType } from "@/types/content";

const statusConfig: Record<ContentStatus, { label: string; color: string; bg: string }> = {
  PUBLISHED: { label: "เผยแพร่", color: "#24A148", bg: "#E8F5E9" },
  DRAFT: { label: "แบบร่าง", color: "#FF944D", bg: "#FFF4E6" },
  UNPUBLISHED: { label: "ปิดการใช้งาน", color: "#F44034", bg: "#FDECEC" },
};

const typeLabel: Record<ContentType, string> = {
  NEWS: "ข่าวสาร",
  PROMOTION: "โปรโมชั่น",
};

interface PreviewContent {
  title: string;
  summary?: string | null;
  content?: string | null;
  mainImage?: string | null;
  bannerImage?: string | null;
  album?: string[];
  coverages?: string[];
  status: string;
  isPublish?: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  expiredAt?: string | null;
  type?: string;
  category?: { id: string; name: string };
}

interface ContentPreviewModalProps {
  open: boolean;
  content: PreviewContent | null;
  onClose: () => void;
}

export function ContentPreviewModal({ open, content, onClose }: ContentPreviewModalProps) {
  if (!open || !content) return null;

  const status = statusConfig[content.status as ContentStatus] || statusConfig.DRAFT;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-full max-w-[720px] max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#EAEAEA]">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#243333]">ตัวอย่างเนื้อหา</h2>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: status.bg, color: status.color }}
            >
              {status.label}
            </span>
            {content.type && typeLabel[content.type as ContentType] && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F0F0F0] text-[#565656]">
                {typeLabel[content.type as ContentType]}
              </span>
            )}
            {content.isPinned && (
              <Pin size={14} className="text-primary" />
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Main Image */}
          {content.mainImage && (
            <div className="w-full h-[280px] rounded-xl overflow-hidden border border-[#EAEAEA]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.mainImage}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Banner */}
          {content.bannerImage && (
            <div className="w-full h-[160px] rounded-xl overflow-hidden border border-[#EAEAEA]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.bannerImage}
                alt="banner"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title & Summary */}
          <div>
            <h3 className="text-xl font-bold text-[#111827]">{content.title}</h3>
            {content.summary && (
              <p className="mt-2 text-sm text-[#565656]">{content.summary}</p>
            )}
          </div>

          {/* Content HTML */}
          {content.content && (
            <div
              className="prose prose-sm max-w-none text-[#565656]"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
          )}

          {/* Coverages */}
          {content.coverages && content.coverages.length > 0 && (
            <div>
              <p className="text-sm font-bold text-[#243333] mb-3">ความคุ้มครอง</p>
              <ul className="space-y-2">
                {content.coverages.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-[#565656]">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Category */}
          {content.category && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9CA3AF]">หมวดหมู่:</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F0F0F0] text-[#565656]">
                {content.category.name}
              </span>
            </div>
          )}

          {/* Album */}
          {content.album && content.album.length > 0 && (
            <div>
              <p className="text-sm font-bold text-[#243333] mb-3">อัลบั้มรูป</p>
              <div className="flex flex-wrap gap-3">
                {content.album.map((url, idx) => (
                  <div key={idx} className="w-[100px] h-[100px] rounded-lg overflow-hidden border border-[#EAEAEA]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`album-${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#EAEAEA] text-xs text-[#9CA3AF]">
            <div className="space-y-1.5">
              <p>สร้างเมื่อ: {new Date(content.createdAt).toLocaleString("th-TH")}</p>
              <p>อัปเดตเมื่อ: {new Date(content.updatedAt).toLocaleString("th-TH")}</p>
            </div>
            <div className="space-y-1.5">
              {content.publishedAt && (
                <p>เผยแพร่เมื่อ: {new Date(content.publishedAt).toLocaleString("th-TH")}</p>
              )}
              {content.expiredAt && (
                <p>หมดอายุ: {new Date(content.expiredAt).toLocaleDateString("th-TH")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
