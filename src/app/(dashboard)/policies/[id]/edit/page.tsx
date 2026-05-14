"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import { PageBackHeader } from "@/components/layout/PageBackHeader";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/upload";
import { uploadApi } from "@/api/upload";
import { productApi } from "@/api/product";
import { policyCategoryApi } from "@/api/policy-category";
import type { PolicyCategory } from "@/types/policy-category";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<PolicyCategory[]>([]);

  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [album, setAlbum] = useState<string[]>([]);
  const [coverages, setCoverages] = useState<string[]>([]);
  const [coverageInput, setCoverageInput] = useState("");
  const [isPublish, setIsPublish] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [expiredAt, setExpiredAt] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [albumUploading, setAlbumUploading] = useState(false);

  useEffect(() => {
    policyCategoryApi.getAll().then((res) => {
      if (res.success) setCategories(res.data);
    });
    productApi.getById(id).then((res) => {
      if (res.success) {
        const d = res.data;
        setCategoryId(d.categoryId);
        setTitle(d.title);
        setSummary(d.summary || "");
        setContent(d.content || "");
        setMainImage(d.mainImage || "");
        setBannerImage(d.bannerImage || "");
        setAlbum(d.album || []);
        setCoverages(d.coverages || []);
        setIsPublish(d.isPublish);
        setIsPinned(d.isPinned);
        setExpiredAt(d.expiredAt ? d.expiredAt.split("T")[0] : "");
        setPublishDate(d.publishedAt ? d.publishedAt.split("T")[0] : "");
      }
      setFetching(false);
    });
  }, [id]);

  const handleAlbumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAlbumUploading(true);
    try {
      const res = await uploadApi.upload(file);
      if (res.success) setAlbum((prev) => [...prev, res.data.url]);
    } finally {
      setAlbumUploading(false);
    }
    e.target.value = "";
  };

  const removeAlbumImage = (index: number) => {
    setAlbum((prev) => prev.filter((_, i) => i !== index));
  };

  const isValid = () => !!(title && categoryId && mainImage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) return;
    setLoading(true);
    try {
      const res = await productApi.update(id, {
        categoryId,
        title,
        summary: summary || undefined,
        content: content || undefined,
        mainImage,
        bannerImage: bannerImage || undefined,
        album,
        coverages: coverages.length > 0 ? coverages : undefined,
        isPublish,
        isPinned,
        expiredAt: expiredAt || undefined,
      });
      if (res.success) router.push("/policies");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-sm text-[#9CA3AF]">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div>
      <PageBackHeader
        title="แก้ไขผลิตภัณฑ์"
        description="แก้ไขแผนประกัน"
        onBack={() => router.back()}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-[1fr_320px] gap-6">
          {/* Left */}
          <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#EAEAEA] p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Input size="lg" className="w-full" label="ชื่อผลิตภัณฑ์ *" placeholder="กรอกชื่อ" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Select size="lg" className="w-full" label="หมวดหมู่ *" placeholder="เลือกหมวดหมู่" value={categoryId} onChange={setCategoryId} options={categories.map((c) => ({ label: c.name, value: c.id }))} />
            </div>

            <Input size="lg" className="w-full" label="สรุปย่อ" placeholder="กรอกสรุปย่อ" value={summary} onChange={(e) => setSummary(e.target.value)} />

            <div className="relative w-full">
              <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[14px] font-bold text-dark">เนื้อหา</label>
              <textarea rows={8} placeholder="กรอกเนื้อหา (รองรับ HTML)" value={content} onChange={(e) => setContent(e.target.value)} className="w-full border border-[#DCDCDC] bg-white text-[#565656] outline-none placeholder:text-[#B7B7B7] transition-all duration-200 hover:border-primary hover:shadow-[0_4px_12px_rgba(7,162,162,0.08)] focus:border-primary rounded-xl px-[22px] py-4 text-base resize-none" />
            </div>

            <div>
              <p className="text-[14px] font-bold text-dark mb-2">รูปหลัก *</p>
              <ImageUpload value={mainImage} onChange={setMainImage} />
            </div>

            <div>
              <p className="text-[14px] font-bold text-dark mb-2">รูป Banner</p>
              <ImageUpload value={bannerImage} onChange={setBannerImage} />
            </div>

            <div>
              <p className="text-[14px] font-bold text-dark mb-2">อัลบั้มรูป</p>
              <div className="flex flex-wrap gap-3">
                {album.map((url, idx) => (
                  <div key={idx} className="relative w-[120px] h-[120px] rounded-xl overflow-hidden border border-[#EAEAEA]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`album-${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeAlbumImage(idx)} className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-white/90 text-[#F44034] hover:bg-white shadow-sm">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <label className="w-[120px] h-[120px] rounded-xl border-2 border-dashed border-[#DCDCDC] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary/[0.02] transition-all">
                  {albumUploading ? <span className="text-xs text-primary">อัปโหลด...</span> : <><Plus size={20} className="text-[#9CA3AF]" /><span className="text-[11px] text-[#9CA3AF]">เพิ่มรูป</span></>}
                  <input type="file" accept="image/*" onChange={handleAlbumUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Coverages */}
            <div>
              <p className="text-[14px] font-bold text-dark mb-2">ความคุ้มครอง</p>
              <div className="space-y-2">
                {coverages.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex-1 px-4 py-2.5 rounded-[10px] border border-[#EAEAEA] text-sm text-[#565656] bg-gray-50">{item}</span>
                    <button type="button" onClick={() => setCoverages((prev) => prev.filter((_, i) => i !== idx))} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#F44034] hover:bg-[#FDECEC] transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="เพิ่มหัวข้อความคุ้มครอง"
                    value={coverageInput}
                    onChange={(e) => setCoverageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && coverageInput.trim()) {
                        e.preventDefault();
                        setCoverages((prev) => [...prev, coverageInput.trim()]);
                        setCoverageInput("");
                      }
                    }}
                    className="flex-1 h-[42px] px-4 rounded-[10px] border border-[#DCDCDC] text-sm text-[#565656] outline-none placeholder:text-[#B7B7B7] focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (coverageInput.trim()) {
                        setCoverages((prev) => [...prev, coverageInput.trim()]);
                        setCoverageInput("");
                      }
                    }}
                    className="h-[42px] px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="w-4 h-4 rounded border-[#DCDCDC] text-primary focus:ring-primary/20" />
                <span className="text-sm text-[#565656]">ปักหมุด (แสดงบนสุด)</span>
              </label>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#EAEAEA] p-6">
              <h3 className="text-sm font-bold text-[#243333] mb-4">สถานะการเผยแพร่</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#EAEAEA] cursor-pointer hover:border-primary/30 transition-colors">
                  <input type="radio" name="publishStatus" checked={!isPublish} onChange={() => setIsPublish(false)} className="w-4 h-4 text-primary focus:ring-primary/20" />
                  <div><p className="text-sm font-medium text-[#FF944D]">แบบร่าง</p><p className="text-xs text-[#9CA3AF]">บันทึกไว้ก่อน ยังไม่เผยแพร่</p></div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#EAEAEA] cursor-pointer hover:border-primary/30 transition-colors">
                  <input type="radio" name="publishStatus" checked={isPublish} onChange={() => setIsPublish(true)} className="w-4 h-4 text-primary focus:ring-primary/20" />
                  <div><p className="text-sm font-medium text-[#24A148]">เผยแพร่</p><p className="text-xs text-[#9CA3AF]">แสดงผลทันทีหลังบันทึก</p></div>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#EAEAEA] p-6">
              <h3 className="text-sm font-bold text-[#243333] mb-4">กำหนดเวลา</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#565656] mb-1.5">วันที่เผยแพร่</label>
                  <input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="w-full h-[42px] px-4 rounded-[10px] border border-[#DCDCDC] text-sm text-[#565656] outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#565656] mb-1.5">วันที่สิ้นสุด</label>
                  <input type="date" value={expiredAt} onChange={(e) => setExpiredAt(e.target.value)} className="w-full h-[42px] px-4 rounded-[10px] border border-[#DCDCDC] text-sm text-[#565656] outline-none focus:border-primary transition-colors" />
                  <p className="mt-1 text-[11px] text-[#9CA3AF]">ผลิตภัณฑ์จะถูกปิดอัตโนมัติเมื่อถึงวันที่กำหนด</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button type="submit" disabled={loading || !isValid()} className="w-full h-[44px] rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button type="button" onClick={() => router.back()} className="w-full h-[44px] rounded-[10px] border border-[#DCDCDC] text-sm font-medium text-[#565656] hover:bg-gray-50 transition-colors">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
