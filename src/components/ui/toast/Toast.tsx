"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CheckCircle, XCircle, Info, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
  removeToast: () => {},
});

const config: Record<ToastType, { color: string; bg: string; Icon: typeof CheckCircle }> = {
  success: { color: "#22C55E", bg: "#F0FDF4", Icon: CheckCircle },
  error:   { color: "#F44034", bg: "#FFF5F5", Icon: XCircle },
  info:    { color: "#2D7CA4", bg: "#EFF8FF", Icon: Info },
  warning: { color: "#FF944D", bg: "#FFF7ED", Icon: AlertCircle },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const { color, bg, Icon } = config[toast.type];
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setTimeout(() => onRemove(toast.id), 4000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [toast.id, onRemove]);

  return (
    <div
      className="flex w-[360px] items-start gap-3 rounded-[12px] border border-[#EAEAEA] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)] overflow-hidden animate-[fade-up_0.25s_ease-out]"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex-shrink-0 pl-4 pt-4">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: bg }}
        >
          <Icon size={18} style={{ color }} strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex-1 py-4 pr-2 min-w-0">
        <p className="text-sm font-bold text-[#243333]">{toast.title}</p>
        <p className="mt-0.5 text-xs text-[#9CA3AF] leading-relaxed">{toast.message}</p>
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-3 text-[#B7B7B7] hover:text-[#707070] transition-colors"
        aria-label="ปิด"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed right-5 top-5 z-[300] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

type ApiError = { response?: { data?: { message?: string } } };

function extractMessage(err: unknown): string {
  const msg = (err as ApiError)?.response?.data?.message;
  if (msg) return msg;
  if (err instanceof Error) return err.message;
  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}

export function useToast() {
  const { addToast } = useContext(ToastContext);

  return {
    success: (message: string, title = "สำเร็จ") =>
      addToast({ type: "success", title, message }),
    error: (message: string, title = "เกิดข้อผิดพลาด") =>
      addToast({ type: "error", title, message }),
    info: (message: string, title = "ข้อมูล") =>
      addToast({ type: "info", title, message }),
    warning: (message: string, title = "คำเตือน") =>
      addToast({ type: "warning", title, message }),
    fromError: (err: unknown, title = "เกิดข้อผิดพลาด") =>
      addToast({ type: "error", title, message: extractMessage(err) }),
  };
}
