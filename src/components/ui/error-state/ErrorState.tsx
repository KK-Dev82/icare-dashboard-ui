"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <AlertCircle size={36} className="text-error" />
      <p className="text-sm font-medium text-[#565656]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 h-[36px] px-5 rounded-[8px] border border-[#DCDCDC] text-sm font-medium text-[#565656] hover:border-primary hover:text-primary transition-colors"
        >
          <RefreshCw size={14} />
          ลองใหม่
        </button>
      )}
    </div>
  );
}
