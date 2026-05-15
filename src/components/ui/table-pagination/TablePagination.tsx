"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  current: number;
  total: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  stickToBottom?: boolean;
  className?: string;
}

export function TablePagination({
  current,
  total,
  page = 1,
  totalPages = 1,
  onPageChange,
  stickToBottom = true,
  className = "",
}: TablePaginationProps) {
  const pages = Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1);
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  const handlePageChange = (nextPage: number) => {
    if (!onPageChange || nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    onPageChange(nextPage);
  };

  return (
    <div
      className={`flex items-center justify-between ${
        stickToBottom ? "mt-auto pt-6" : "mt-6 pt-4"
      } ${className}`}
    >
      <p className="text-sm text-gray-400">
        แสดง {current} จาก {total} รายการ
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={() => handlePageChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EAEAEA] text-gray-400 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="หน้าก่อนหน้า"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => handlePageChange(pageNumber)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              pageNumber === page
                ? "bg-primary text-white"
                : "border border-[#EAEAEA] text-gray-400 hover:border-primary hover:text-primary"
            }`}
            aria-current={pageNumber === page ? "page" : undefined}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          disabled={!canGoNext}
          onClick={() => handlePageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EAEAEA] text-gray-400 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="หน้าถัดไป"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
