"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Power, Plus } from "lucide-react";
import { ActionIconButton } from "@/components/ui/action-button";
import { TablePagination } from "@/components/ui/table-pagination";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConfirmModal, ContentPreviewModal } from "@/components/ui/modal";
import { contentApi } from "@/api/content";
import type { Content, ContentStatus } from "@/types/content";
import type { ContentCategory } from "@/types/content-category";
import { contentCategoryApi } from "@/api/content-category";

const statusConfig: Record<ContentStatus, { label: string; color: string }> = {
  PUBLISHED: { label: "เผยแพร่", color: "#24A148" },
  DRAFT: { label: "แบบร่าง", color: "#FF944D" },
  UNPUBLISHED: { label: "ปิดการใช้งาน", color: "#F44034" },
};

export default function NewsPage() {
  const [items, setItems] = useState<Content[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [confirmItem, setConfirmItem] = useState<Content | null>(null);
  const [previewItem, setPreviewItem] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const router = useRouter();

  const fetchData = async (p?: number) => {
    setLoading(true);
    const params: Record<string, string | number> = { page: p || page, limit: 10 };
    if (search) params.keyword = search;
    if (filterCategory) params.categoryId = filterCategory;
    if (filterStatus) params.status = filterStatus;
    const res = await contentApi.getAll(params);
    if (res.success) {
      setItems(res.data);
      if (res.meta) setMeta(res.meta);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    contentCategoryApi.getAll().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchData(1);
  };

  const handleClear = () => {
    setSearch("");
    setFilterCategory("");
    setFilterStatus("");
    setPage(1);
    fetchData(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData(newPage);
  };

  const handleTogglePublish = async (item: Content) => {
    setConfirmItem(item);
  };

  const handleConfirmToggle = async () => {
    if (!confirmItem) return;
    if (confirmItem.isPublish) {
      await contentApi.unpublish(confirmItem.id);
    } else {
      await contentApi.publish(confirmItem.id);
    }
    setConfirmItem(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await contentApi.delete(id);
    fetchData();
  };

  return (
    <div>
      {/* Content Card */}
      <div className="flex w-full flex-col rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        {/* Page Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#EAEAEA]">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              รายการข่าวสาร &amp; โปรโมชั่น
            </h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              จัดการและเผยแพร่ข่าวสารประชาสัมพันธ์ได้อย่างง่ายดาย
            </p>
          </div>
          <button
            onClick={() => router.push("/news/create")}
            className="flex items-center gap-2 h-[42px] px-5 rounded-[10px] bg-[#24A148] text-white text-sm font-medium hover:bg-[#1e8e3e] transition-all hover:shadow-[0_4px_12px_rgba(36,161,72,0.25)]">
            <Plus size={18} />
            เพิ่มข่าวสาร
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 mb-8">
          <Input
            size="md"
            className="w-[280px]"
            label="ค้นหา"
            placeholder="ค้นหา"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            size="md"
            className="w-[200px]"
            label="หมวดหมู่"
            placeholder="เลือกหมวดหมู่"
            value={filterCategory}
            onChange={setFilterCategory}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
          <Select
            size="md"
            className="w-[200px]"
            label="สถานะ"
            placeholder="เลือกสถานะ"
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { label: "เผยแพร่", value: "PUBLISHED" },
              { label: "แบบร่าง", value: "DRAFT" },
              { label: "ปิดการใช้งาน", value: "UNPUBLISHED" },
            ]}
          />
          <button
            onClick={handleSearch}
            className="h-[42px] rounded-[8px] bg-[#FF944D] px-8 text-[14px] font-medium text-white transition hover:bg-[#f28338]"
          >
            ค้นหา
          </button>
          <button
            onClick={handleClear}
            className="h-[42px] rounded-[8px] border border-[#DCDCDC] px-8 text-[14px] font-medium text-[#565656] transition hover:bg-gray-50"
          >
            ล้าง
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ลำดับ</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">รูปภาพ</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">หัวข้อ</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">หมวดหมู่</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">วันที่เผยแพร่</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">สถานะ</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#F5F5F5] animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 w-6 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="w-[72px] h-[72px] bg-gray-100 rounded-lg" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-48 bg-gray-100 rounded mb-2" /><div className="h-3 w-32 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="flex justify-end gap-2"><div className="w-8 h-8 bg-gray-100 rounded-lg" /><div className="w-8 h-8 bg-gray-100 rounded-lg" /><div className="w-8 h-8 bg-gray-100 rounded-lg" /></div></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-[#9CA3AF]">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : items.map((item, idx) => {
                const status = statusConfig[item.status];
                return (
                  <tr
                    key={item.id}
                    className="border-b border-[#F5F5F5] hover:bg-primary/[0.02] transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-gray-600">{idx + 1}</td>
                    <td className="py-4 px-4">
                      <div className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-gray-100">
                        {item.mainImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.mainImage}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#9CA3AF]">
                            No Image
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-[280px]">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">
                        {item.title}
                      </p>
                      {item.summary && (
                        <p className="text-xs text-[#9CA3AF] mt-0.5 line-clamp-1">
                          {item.summary}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {item.category?.name || "-"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium" style={{ color: status.color }}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <ActionIconButton
                          icon={Eye}
                          variant="primary"
                          onClick={() => setPreviewItem(item)}
                        />
                        <ActionIconButton
                          icon={Pencil}
                          variant="accent"
                          onClick={() => router.push(`/news/${item.id}/edit`)}
                        />
                        <ActionIconButton
                          icon={Power}
                          variant={item.isPublish ? "danger" : "success"}
                          onClick={() => handleTogglePublish(item)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <TablePagination
          current={items.length}
          total={meta.total}
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={!!confirmItem}
        title={confirmItem?.isPublish ? "ปิดการเผยแพร่" : "เผยแพร่เนื้อหา"}
        message={
          confirmItem?.isPublish
            ? `ต้องการปิดการเผยแพร่ "${confirmItem?.title}" ใช่หรือไม่?`
            : `ต้องการเผยแพร่ "${confirmItem?.title}" ใช่หรือไม่?`
        }
        confirmLabel={confirmItem?.isPublish ? "ปิดการเผยแพร่" : "เผยแพร่"}
        confirmColor={confirmItem?.isPublish ? "danger" : "success"}
        onConfirm={handleConfirmToggle}
        onCancel={() => setConfirmItem(null)}
      />

      {/* Preview Modal */}
      <ContentPreviewModal
        open={!!previewItem}
        content={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  );
}
