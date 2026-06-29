"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { contactCaseApi } from "@/api/contact-case";
import { ActionIconButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { ContactCaseDetailModal } from "@/components/ui/modal";
import { TablePagination } from "@/components/ui/table-pagination";
import type { ContactCase } from "@/types/contact-case";
import type { PaginationMeta } from "@/types/member";

const CONTACT_PAGE_SIZE = 5;

const defaultContactMeta: PaginationMeta = {
  page: 1,
  limit: CONTACT_PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

export function ContactCasesWidget() {
  const [contactCases, setContactCases] = useState<ContactCase[]>([]);
  const [contactMeta, setContactMeta] = useState<PaginationMeta>(defaultContactMeta);
  const [contactLoading, setContactLoading] = useState(true);
  const [contactSearch, setContactSearch] = useState("");
  const [appliedContactSearch, setAppliedContactSearch] = useState("");
  const [contactPage, setContactPage] = useState(1);
  const [selectedContactCase, setSelectedContactCase] = useState<ContactCase | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const readTimerRef = useRef<number | null>(null);

  const fetchUnreadContactCases = useCallback(async () => {
    setContactLoading(true);

    try {
      const res = await contactCaseApi.getAll({
        page: contactPage,
        limit: CONTACT_PAGE_SIZE,
        keyword: appliedContactSearch || undefined,
        readStatus: "UNREAD",
      });

      setContactCases(res.data);
      setContactMeta({
        ...res.meta,
        totalPages: Math.max(1, res.meta.totalPages),
      });
    } catch (err) {
      console.error("[dashboard] contact cases failed", err);
      setContactCases([]);
      setContactMeta(defaultContactMeta);
    } finally {
      setContactLoading(false);
    }
  }, [appliedContactSearch, contactPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchUnreadContactCases();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchUnreadContactCases]);

  const clearReadTimer = useCallback(() => {
    if (readTimerRef.current) {
      window.clearTimeout(readTimerRef.current);
      readTimerRef.current = null;
    }
  }, []);

  const scheduleMarkRead = useCallback(
    (contactCase: ContactCase) => {
      clearReadTimer();

      if (contactCase.readStatus !== "UNREAD") return;

      readTimerRef.current = window.setTimeout(async () => {
        try {
          const nextContactCase = await contactCaseApi.markRead(contactCase.id);
          setSelectedContactCase((current) =>
            current?.id === contactCase.id
              ? { ...current, ...nextContactCase, category: current.category ?? nextContactCase.category }
              : current
          );
          await fetchUnreadContactCases();
        } catch (err) {
          console.error("[dashboard] contact case mark read failed", err);
        } finally {
          readTimerRef.current = null;
        }
      }, 3000);
    },
    [clearReadTimer, fetchUnreadContactCases]
  );

  useEffect(() => clearReadTimer, [clearReadTimer]);

  const handleOpenContactDetail = async (item: ContactCase) => {
    setDetailLoadingId(item.id);

    try {
      const detail = await contactCaseApi.getById(item.id);
      setSelectedContactCase(detail);
      scheduleMarkRead(detail);
    } catch (err) {
      console.error("[dashboard] contact case detail failed", err);
    } finally {
      setDetailLoadingId(null);
    }
  };

  const handleCloseContactDetail = () => {
    clearReadTimer();
    setSelectedContactCase(null);
  };

  return (
    <section
      className="flex flex-col rounded-[18px] bg-white px-6 py-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:px-8 xl:col-span-2"
      style={{ fontFamily: '"LINE Seed Sans TH", var(--font-noto-sans-thai), sans-serif' }}
    >
      <PanelHeader
        title="คำร้อง / ติดต่อ"
        description="รวมคำร้องที่ยังไม่ได้อ่าน"
      />

      <div className="mt-5 flex flex-1 flex-col border-t border-[#EAEAEA] pt-6">
        <div className="flex items-center gap-3">
          <Input
            size="md"
            className="min-w-0 flex-1"
            label="ค้นหา"
            placeholder="ค้นหาเลขที่ร้อง, หัวข้อ, เบอร์โทรศัพท์, ผู้ติดต่อ"
            value={contactSearch}
            onChange={(event) => setContactSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setAppliedContactSearch(contactSearch.trim());
                setContactPage(1);
              }
            }}
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[620px] table-fixed">
            <colgroup>
              <col className="w-[64px]" />
              <col className="w-[138px]" />
              <col className="w-[120px]" />
              <col />
              <col className="w-[72px]" />
            </colgroup>
            <thead>
              <tr>
                <TableHead>ลำดับ</TableHead>
                <TableHead>เลขที่ร้อง</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>หัวข้อ</TableHead>
                <TableHead className="sticky right-0 bg-white shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]">จัดการ</TableHead>
              </tr>
            </thead>
            <tbody>
              {contactLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="animate-pulse border-b border-[#F5F5F5]">
                    {Array.from({ length: 5 }).map((__, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`px-2 py-[13px] ${cellIndex === 4 ? "sticky right-0 bg-white shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]" : ""}`}
                      >
                        <div className="mx-auto h-3 w-14 rounded bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : contactCases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-[#9CA3AF]">
                    ยังไม่มีข้อมูลคำร้อง / ติดต่อ
                  </td>
                </tr>
              ) : (
                contactCases.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#F5F5F5] transition-colors hover:bg-primary/[0.02]"
                  >
                    <TableCell>
                      {(contactMeta.page - 1) * contactMeta.limit + index + 1}
                    </TableCell>
                    <TableCell>{item.caseNo}</TableCell>
                    <TableCell>{item.category?.name ?? "-"}</TableCell>
                    <TableCell className="truncate">{item.subject}</TableCell>
                    <TableCell className="sticky right-0 bg-white shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                      <ActionIconButton
                        icon={Search}
                        variant="primary"
                        iconSize={14}
                        iconStrokeWidth={3}
                        className="mx-auto rounded-[6px]"
                        disabled={detailLoadingId === item.id}
                        onClick={() => handleOpenContactDetail(item)}
                      />
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          current={contactCases.length}
          total={contactMeta.total}
          page={contactMeta.page}
          totalPages={contactMeta.totalPages}
          onPageChange={setContactPage}
        />
      </div>

      <ContactCaseDetailModal
        open={Boolean(selectedContactCase)}
        contactCase={selectedContactCase}
        onClose={handleCloseContactDetail}
      />
    </section>
  );
}

function PanelHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold leading-8 text-[#243333]">{title}</h2>
      <p className="text-base leading-[25px] text-[#9FA2A9]">{description}</p>
    </div>
  );
}

function TableHead({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-2 py-3 text-center text-[11px] font-semibold text-[#707070] ${className}`}>
      {children}
    </th>
  );
}

function TableCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-2 py-[13px] text-center text-[14px] leading-5 text-[#707070] ${className}`}>
      {children}
    </td>
  );
}
