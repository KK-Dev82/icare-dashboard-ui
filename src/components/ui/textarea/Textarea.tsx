"use client";

import { type TextareaHTMLAttributes } from "react";

const sizes = {
  md: {
    wrapper: "w-[230px]",
    textarea: "min-h-[112px] rounded-[10px] px-4 py-3 text-[14px] leading-5",
    label: "text-[12px]",
  },
  lg: {
    wrapper: "w-[420px]",
    textarea: "min-h-[144px] rounded-xl px-[22px] py-4 text-base leading-6",
    label: "text-[14px]",
  },
};

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  size?: "md" | "lg";
}

export function Textarea({
  label,
  size = "lg",
  className,
  ...props
}: TextareaProps) {
  const styles = sizes[size];

  return (
    <div className={`relative ${styles.wrapper} ${className ?? ""}`}>
      {label && (
        <label
          htmlFor={props.id}
          className={`absolute -top-2.5 left-4 z-10 bg-white px-2 font-bold text-dark ${styles.label}`}
        >
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full resize-none border border-[#DCDCDC] bg-white text-[#565656] outline-none placeholder:text-[#B7B7B7] transition-all duration-200 hover:border-primary hover:shadow-[0_4px_12px_rgba(7,162,162,0.08)] focus:border-primary disabled:cursor-not-allowed disabled:bg-gray-50 ${styles.textarea}`}
      />
    </div>
  );
}
