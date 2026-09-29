"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  badge?: ReactNode;
}

interface ComboboxProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  loading?: boolean;
  emptyText?: string;
  placeholder?: string;
  size?: "md" | "lg";
  className?: string;
  inputMode?: "text" | "tel" | "numeric" | "search";
  onFocus?: () => void;
}

/**
 * Free-text input with a suggestion list. Typing is never restricted to the
 * options; picking an option just fills the input with its value.
 */
export function Combobox({
  id,
  label,
  value,
  onChange,
  options,
  loading = false,
  emptyText = "ไม่พบข้อมูล",
  placeholder,
  size = "md",
  className,
  inputMode,
  onFocus,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const selectOption = (option: ComboboxOption) => {
    onChange(option.value);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (options.length ? (index + 1) % options.length : -1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        options.length ? (index <= 0 ? options.length - 1 : index - 1) : -1,
      );
    } else if (event.key === "Enter" && open && options[activeIndex]) {
      event.preventDefault();
      selectOption(options[activeIndex]);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <Input
        id={id}
        size={size}
        className="w-full"
        label={label}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          setOpen(true);
          onFocus?.();
        }}
        onBlur={() => {
          setOpen(false);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        style={{ paddingRight: size === "md" ? 40 : 48 }}
      />

      <button
        type="button"
        tabIndex={-1}
        aria-label={open ? "ปิดรายการ" : "เปิดรายการ"}
        // Keep focus in the input so the list isn't closed by blur before toggling.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (open) {
            setOpen(false);
            setActiveIndex(-1);
            return;
          }
          document.getElementById(id)?.focus();
          setOpen(true);
        }}
        className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-center ${
          size === "md" ? "right-3" : "right-4"
        }`}
      >
        <ChevronDown
          size={size === "md" ? 16 : 20}
          strokeWidth={3}
          className={`text-[#213F3F] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-[240px] overflow-y-auto rounded-[10px] border border-[#DCDCDC] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        >
          {loading ? (
            <li className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-[#9CA3AF]">
              <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
              กำลังค้นหา...
            </li>
          ) : options.length === 0 ? (
            <li className="px-4 py-2.5 text-[13px] text-[#9CA3AF]">{emptyText}</li>
          ) : (
            options.map((option, index) => (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                // Keep focus in the input so blur doesn't close the list before the click lands.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2 ${
                  index === activeIndex ? "bg-[#E5F8F8]" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] text-[#252A2A]">{option.label}</p>
                  {option.description && (
                    <p className="truncate text-[12px] text-[#9CA3AF]">{option.description}</p>
                  )}
                </div>
                {option.badge}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
