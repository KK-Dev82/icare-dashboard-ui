"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { uploadApi } from "@/api/upload";

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
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
