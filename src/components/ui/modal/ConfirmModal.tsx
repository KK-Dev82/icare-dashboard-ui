"use client";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "danger" | "success";
  onConfirm: () => void;
  onCancel: () => void;
}

const colorMap = {
  danger: "bg-[#F44034] hover:bg-[#F44034]/85",
  success: "bg-[#24A148] hover:bg-[#24A148]/85",
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  confirmColor = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-[20px] border border-[#EAEAEA] shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-8 w-full max-w-[400px]">
        <h2 className="text-lg font-bold text-[#243333]">{title}</h2>
        <p className="mt-2 text-sm text-[#9CA3AF]">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-[40px] px-5 rounded-[10px] border border-[#DCDCDC] text-sm font-medium text-[#565656] hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`h-[40px] px-5 rounded-[10px] text-sm font-medium text-white transition-colors ${colorMap[confirmColor]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
