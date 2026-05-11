"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

const sizes = {
  md: {
    wrapper: "w-[230px]",
    button: "h-[42px] rounded-[10px] px-4",
    text: "text-[14px]",
    icon: 16,
    label: "text-[12px]",
    option: "px-4 py-2.5 text-[14px]",
  },
  lg: {
    wrapper: "w-[420px]",
    button: "h-[56px] rounded-xl px-[22px]",
    text: "text-base",
    icon: 20,
    label: "text-[14px]",
    option: "px-[22px] py-3 text-sm",
  },
};

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  size?: "md" | "lg";
  className?: string;
}

export function Select({
  label,
  placeholder = "เลือกสถานะ",
  options,
  value,
  onChange,
  disabled = false,
  size = "lg",
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const s = sizes[size];

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${s.wrapper} ${className ?? ""}`}>
      {label && (
        <label className={`absolute -top-2.5 left-4 z-10 bg-white px-2 font-bold text-dark ${s.label}`}>
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`relative w-full border bg-white flex items-center justify-between cursor-pointer transition-all duration-200 ${s.button} ${
          disabled
            ? "bg-gray-50 border-[#DCDCDC] opacity-60 cursor-not-allowed"
            : open
            ? "border-primary"
            : "border-[#DCDCDC] hover:border-primary hover:shadow-[0_4px_12px_rgba(7,162,162,0.08)]"
        }`}
      >
        <span className={`${s.text} ${selected ? "text-[#565656]" : "text-[#B7B7B7]"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={s.icon}
          strokeWidth={3}
          className={`text-[#213F3F] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 w-full bg-white rounded-xl border border-[#EAEAEA] shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-1.5">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
                className={`w-full text-left transition-colors ${s.option} ${
                  isSelected
                    ? "bg-[#EDF9F9] text-primary font-medium"
                    : "text-gray-700 hover:bg-[#EDF9F9]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
