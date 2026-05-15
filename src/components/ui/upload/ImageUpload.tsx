"use client";

import { useState, useRef, useEffect } from "react";
import { ImageIcon, Power, Upload, X } from "lucide-react";
import { uploadApi } from "@/api/upload";

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  className?: string;
  variant?: "card" | "settings-row";
  label?: string;
  powerTone?: "muted" | "danger";
}

export function ImageUpload({
  value,
  onChange,
  className,
  variant = "card",
  label,
  powerTone = "muted",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value || "");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external value
  useEffect(() => {
    if (value !== undefined) {
      setPreview(value);
    }
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview ก่อน upload
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Upload to server
    setUploading(true);
    try {
      const res = await uploadApi.upload(file);
      if (res.success) {
        const url = res.data.url;
        setPreview(url);
        onChange?.(url);
      }
    } catch {
      setPreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview("");
    onChange?.("");
    if (inputRef.current) inputRef.current.value = "";
  };

  if (variant === "settings-row") {
    return (
      <div className={className ?? ""}>
        {label && <p className="mb-2 text-sm font-medium text-[#707070]">{label}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="grid grid-cols-[158px_1fr_128px_39px] items-center gap-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-[68px] items-center justify-center overflow-hidden rounded-[6px] border border-dashed border-[#DCDCDC] bg-white text-[#9FA2A9] transition-colors hover:border-primary hover:text-primary"
            aria-label={label ? `เลือกรูป${label}` : "เลือกรูปภาพ"}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon size={32} />
            )}
          </button>
          <input
            readOnly
            value={preview}
            className="h-[39px] w-full rounded-[6px] border border-[#DCDCDC] bg-white px-4 text-sm text-[#707070] outline-none"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="h-[39px] rounded-[6px] bg-[#2D7CA4] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "กำลังอัปโหลด" : "อัปโหลดไฟล์"}
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className={`flex h-[39px] w-[39px] items-center justify-center rounded-[6px] text-white transition-opacity hover:opacity-90 ${
              powerTone === "danger" ? "bg-[#F44034]" : "bg-[#C9C9C9]"
            }`}
            aria-label={label ? `ล้างรูป${label}` : "ล้างรูปภาพ"}
          >
            <Power size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full h-[200px] rounded-xl overflow-hidden border border-[#EAEAEA]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 text-[#F44034] hover:bg-white transition-colors shadow-sm"
          >
            <X size={16} />
          </button>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <span className="text-sm text-primary font-medium">กำลังอัปโหลด...</span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-[200px] rounded-xl border-2 border-dashed border-[#DCDCDC] flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/[0.02] transition-all"
        >
          <Upload size={24} className="text-[#9CA3AF]" />
          <span className="text-sm text-[#9CA3AF]">คลิกเพื่ออัปโหลดรูปภาพ</span>
        </button>
      )}
    </div>
  );
}
