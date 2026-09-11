"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export const TABLE_PAGINATION_PAGE_SIZE = 10;

export function getTableTotalPages(total: number, pageSize = TABLE_PAGINATION_PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function getTablePageStart(page: number, pageSize = TABLE_PAGINATION_PAGE_SIZE) {
  return (page - 1) * pageSize;
}

export function getTablePageItems<T>(
  items: T[],
  page: number,
  pageSize = TABLE_PAGINATION_PAGE_SIZE
) {
  const pageStart = getTablePageStart(page, pageSize);
  return items.slice(pageStart, pageStart + pageSize);
}

interface TablePaginationProps {
  current: number;
  total: number;
  page?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  stickToBottom?: boolean;
  className?: string;
}

export function TablePagination({
  current,
  total,
  page = 1,
  totalPages,
  pageSize = TABLE_PAGINATION_PAGE_SIZE,
  onPageChange,
  stickToBottom = true,
  className = "",
}: TablePaginationProps) {
  const pageCount = totalPages ?? getTableTotalPages(total, pageSize);
  const pages = getVisiblePages(page, pageCount);
  const canGoPrev = page > 1;
  const canGoNext = page < pageCount;

  const handlePageChange = (nextPage: number) => {
    if (!onPageChange || nextPage < 1 || nextPage > pageCount || nextPage === page) return;
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
        {pages.map((pageNumber, index) =>
          pageNumber === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-gray-400"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
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
          ),
        )}
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

function getVisiblePages(page: number, pageCount: number): Array<number | "ellipsis"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const trailingPages = [pageCount - 2, pageCount - 1, pageCount];
  const windowStart = Math.min(Math.max(page - 1, 1), pageCount - 2);
  const leadingPages = [windowStart, windowStart + 1, windowStart + 2];
  const uniquePages = [...new Set([...leadingPages, ...trailingPages])];

  if (leadingPages[leadingPages.length - 1] + 1 < trailingPages[0]) {
    return [...leadingPages, "ellipsis", ...trailingPages];
  }

  return uniquePages;
}
