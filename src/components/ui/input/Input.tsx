"use client";

import { type InputHTMLAttributes } from "react";

const sizes = {
  md: {
    wrapper: "w-[230px]",
    input: "h-[42px] rounded-[10px] px-4 text-[14px]",
    label: "text-[12px]",
    icon: "left-4 h-4 w-4",
  },
  lg: {
    wrapper: "w-[420px]",
    input: "h-[56px] rounded-xl px-[22px] text-base",
    label: "text-[14px]",
    icon: "left-5 h-5 w-5",
  },
};

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  size?: "md" | "lg";
  icon?: React.ReactNode;
}

export function Input({
  label,
  size = "lg",
  icon,
  className,
  ...props
}: InputProps) {
  const s = sizes[size];

  return (
    <div className={`relative ${s.wrapper} ${className ?? ""}`}>
      {label && (
        <label className={`absolute -top-2.5 left-4 z-10 bg-white px-2 font-bold text-dark ${s.label}`}>
          {label}
        </label>
      )}
      {icon && (
        <span className={`absolute ${s.icon} top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none`}>
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`w-full border border-[#DCDCDC] bg-white text-[#565656] outline-none placeholder:text-[#B7B7B7] transition-all duration-200 hover:border-primary hover:shadow-[0_4px_12px_rgba(7,162,162,0.08)] focus:border-primary ${s.input} ${icon ? (size === "md" ? "pl-11" : "pl-12") : ""}`}
      />
    </div>
  );
}
