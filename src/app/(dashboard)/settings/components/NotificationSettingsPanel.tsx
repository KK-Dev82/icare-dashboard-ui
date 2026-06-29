"use client";

import { useCallback, useEffect, useState } from "react";
import { CirclePlus, Info, Pencil, Power, X } from "lucide-react";
import { renewalApi } from "@/api/renewal";
import { settingsApi } from "@/api/settings";
import { ActionIconButton } from "@/components/ui/action-button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { RenewalRule } from "@/types/renewal";

const RENEWAL_ENABLED_KEY = "renewal_enabled";

const PREVIEW_SAMPLES: Record<string, string> = {
  "{{policyName}}": "ประกันอุบัติเหตุส่วนบุคคล",
  "{{expireDate}}": "16/07/2569",
  "{{policyNo}}": "POL-2569-00123",
};

function applyPreview(template: string, days: string): string {
  const vars = { ...PREVIEW_SAMPLES, "{{days}}": days || "30" };
  return Object.entries(vars).reduce((text, [key, val]) => text.replaceAll(key, val), template);
}

function sortRenewalRules(rules: RenewalRule[]) {
  return [...rules].sort((a, b) => b.daysBefore - a.daysBefore);
}

export function NotificationSettingsPanel() {
  const toast = useToast();
  const [enabled, setEnabled] = useState(true);
  const [confirmItem, setConfirmItem] = useState<RenewalRule | null>(null);
  const [confirmGlobal, setConfirmGlobal] = useState(false);
  const [items, setItems] = useState<RenewalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<RenewalRule | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formDays, setFormDays] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingGlobal, setUpdatingGlobal] = useState(false);

  const sortedItems = sortRenewalRules(items);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [rules, settings] = await Promise.all([
        renewalApi.getRules(),
        settingsApi.getSettings(),
      ]);
      const renewalEnabledSetting = settings.find(
        (item) => item.key === RENEWAL_ENABLED_KEY,
      );

      setItems(rules);
      setEnabled(renewalEnabledSetting?.value !== "false");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchData]);

  const openCreate = () => {
    setEditItem(null);
    setFormDays("");
    setFormTitle("");
    setFormDescription("");
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (item: RenewalRule) => {
    setEditItem(item);
    setFormDays(String(item.daysBefore));
    setFormTitle(item.titleTemplate);
    setFormDescription(item.bodyTemplate);
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditItem(null);
    setFormError("");
  };

  const handleGlobalToggleClick = () => {
    setConfirmGlobal(true);
  };

  const handleGlobalToggle = async () => {
    const nextEnabled = !enabled;
    setUpdatingGlobal(true);
    setEnabled(nextEnabled);

    try {
      await settingsApi.updateSettings({
        settings: [
          {
            key: RENEWAL_ENABLED_KEY,
            value: String(nextEnabled),
          },
        ],
      });
      toast.success(nextEnabled ? "เปิดการแจ้งเตือนสำเร็จ" : "ปิดการแจ้งเตือนสำเร็จ");
    } catch (error) {
      setEnabled(!nextEnabled);
      toast.fromError(error);
    } finally {
      setUpdatingGlobal(false);
    }
  };

  const handleSave = async () => {
    const daysBefore = Number(formDays);
    const titleTemplate = formTitle.trim();
    const bodyTemplate = formDescription.trim();

    if (!Number.isInteger(daysBefore) || daysBefore <= 0) {
      setFormError("กรุณาระบุจำนวนวันเป็นเลขจำนวนเต็มมากกว่า 0");
      return;
    }
    if (!titleTemplate) {
      setFormError("กรุณาระบุหัวข้อแจ้งเตือน");
      return;
    }
    if (!bodyTemplate) {
      setFormError("กรุณาระบุรายละเอียดแจ้งเตือน");
      return;
    }
    if (items.some((item) => item.daysBefore === daysBefore && item.id !== editItem?.id)) {
      toast.warning("มีการตั้งค่าจำนวนวันนี้อยู่แล้ว");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editItem) {
        const updatedRule = await renewalApi.updateRule(editItem.id, {
          daysBefore,
          titleTemplate,
          bodyTemplate,
        });
        setItems((current) =>
          current.map((item) => (item.id === updatedRule.id ? updatedRule : item)),
        );
      } else {
        const createdRule = await renewalApi.createRule({
          daysBefore,
          titleTemplate,
          bodyTemplate,
        });
        setItems((current) => [...current, createdRule]);
      }

      toast.success(editItem ? "แก้ไขข้อความแจ้งเตือนสำเร็จ" : "เพิ่มข้อความแจ้งเตือนสำเร็จ");
      setShowForm(false);
      setEditItem(null);
    } catch (error) {
      toast.fromError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleClick = (item: RenewalRule) => {
    setConfirmItem(item);
  };

  const handleToggle = async (item: RenewalRule) => {
    setUpdatingId(item.id);

    try {
      const updatedRule = await renewalApi.updateRule(item.id, {
        isEnabled: !item.isEnabled,
      });
      setItems((current) =>
        current.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule)),
      );
      toast.success(item.isEnabled ? "ปิดการแจ้งเตือนสำเร็จ" : "เปิดการแจ้งเตือนสำเร็จ");
    } catch (error) {
      toast.fromError(error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-5 flex flex-col gap-3 border-b border-[#EAEAEA] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#243333]">ตั้งค่าการแจ้งเตือนกรมธรรม์</h2>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            ตั้งค่าข้อความแจ้งเตือนล่วงหน้าก่อนกรมธรรม์หมดอายุ
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-sm font-semibold text-[#243333]">เปิดใช้งานการแจ้งเตือน</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="เปิดใช้งานการแจ้งเตือน"
            onClick={handleGlobalToggleClick}
            disabled={updatingGlobal}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-[0.85] disabled:cursor-not-allowed disabled:opacity-60 ${
              enabled ? "bg-[#F44034]" : "bg-[#DCDCDC]"
            }`}
          >
            <Power size={15} strokeWidth={3} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[58px] rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : errorMessage && items.length === 0 ? (
        <ErrorState message={errorMessage} onRetry={fetchData} />
      ) : sortedItems.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#9CA3AF]">
          ยังไม่มีข้อความแจ้งเตือน
        </p>
      ) : (
        <div className="space-y-3">
          {errorMessage && (
            <div className="rounded-[8px] border border-[#F44034]/20 bg-[#F44034]/5 px-4 py-3 text-sm text-[#F44034]">
              {errorMessage}
            </div>
          )}

          {sortedItems.map((item, index) => {
            const isUpdating = updatingId === item.id;

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-[10px] border border-[#EAEAEA] px-4 py-3 transition-colors hover:border-primary/30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#DCDCDC] text-xs text-[#707070]">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#243333]">
                    {item.daysBefore} วัน
                  </p>
                  <p className="truncate text-xs text-[#9CA3AF]">{item.titleTemplate}</p>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium ${
                    item.isEnabled ? "text-[#24A148]" : "text-[#F44034]"
                  }`}
                >
                  {item.isEnabled ? "เปิด" : "ปิด"}
                </span>
                <ActionIconButton
                  icon={Pencil}
                  variant="accent"
                  aria-label={`แก้ไข ${item.daysBefore} วัน`}
                  onClick={() => openEdit(item)}
                  disabled={isUpdating}
                />
                <ActionIconButton
                  icon={Power}
                  variant={item.isEnabled ? "danger" : "success"}
                  iconStrokeWidth={3}
                  aria-label={`${item.isEnabled ? "ปิด" : "เปิด"} ${item.daysBefore} วัน`}
                  onClick={() => handleToggleClick(item)}
                  disabled={isUpdating}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={openCreate}
          className="flex h-[39px] items-center justify-center gap-2 rounded-[6px] bg-primary px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <CirclePlus size={16} />
          เพิ่มข้อความแจ้งเตือน
        </button>
      </div>

      <ConfirmModal
        open={Boolean(confirmItem)}
        title={confirmItem?.isEnabled ? "ปิดการแจ้งเตือน" : "เปิดการแจ้งเตือน"}
        message={`ต้องการ${confirmItem?.isEnabled ? "ปิด" : "เปิด"}การแจ้งเตือน "${confirmItem?.daysBefore} วันก่อนหมดอายุ" ใช่หรือไม่?`}
        confirmLabel={confirmItem?.isEnabled ? "ปิดการแจ้งเตือน" : "เปิดการแจ้งเตือน"}
        confirmColor={confirmItem?.isEnabled ? "danger" : "success"}
        onConfirm={() => { void handleToggle(confirmItem!); setConfirmItem(null); }}
        onCancel={() => setConfirmItem(null)}
      />

      <ConfirmModal
        open={confirmGlobal}
        title={enabled ? "ปิดการแจ้งเตือนทั้งหมด" : "เปิดการแจ้งเตือนทั้งหมด"}
        message={`ต้องการ${enabled ? "ปิด" : "เปิด"}การแจ้งเตือนกรมธรรม์ทั้งหมดใช่หรือไม่?`}
        confirmLabel={enabled ? "ปิดการแจ้งเตือน" : "เปิดการแจ้งเตือน"}
        confirmColor={enabled ? "danger" : "success"}
        onConfirm={() => { void handleGlobalToggle(); setConfirmGlobal(false); }}
        onCancel={() => setConfirmGlobal(false)}
      />

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/30"
            onClick={closeForm}
            aria-label="ปิด"
          />
          <div className="relative w-full max-w-[860px] rounded-[24px] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#243333]">
                {editItem ? "แก้ไขข้อความแจ้งเตือน" : "เพิ่มข้อความแจ้งเตือน"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="text-[#9CA3AF] transition-colors hover:text-gray-600 disabled:opacity-60"
                aria-label="ปิด"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <Input
                size="lg"
                className="w-full"
                label="จำนวนวันก่อนหมดอายุ *"
                placeholder="เช่น 30"
                type="number"
                min={1}
                step={1}
                value={formDays}
                onChange={(event) => setFormDays(event.target.value)}
                disabled={saving}
              />

              <div>
                <h3 className="mb-3 text-sm font-bold text-[#243333]">ข้อความแจ้งเตือน</h3>
                <div className="mb-3 rounded-[10px] border border-[#CDECEC] bg-[#F3FBFB] px-4 py-3">
                  <div className="flex gap-3">
                    <Info size={18} className="mt-0.5 shrink-0 text-primary" />
                    <div className="min-w-0 text-xs leading-5 text-[#565656]">
                      <p className="font-bold text-[#243333]">ตัวแปรที่ใช้แทนข้อมูลจริงได้</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          { key: "{{policyName}}", label: "ชื่อกรมธรรม์" },
                          { key: "{{days}}", label: "จำนวนวัน" },
                          { key: "{{expireDate}}", label: "วันหมดอายุ" },
                          { key: "{{policyNo}}", label: "เลขกรมธรรม์" },
                        ].map(({ key, label }) => (
                          <span
                            key={key}
                            className="flex items-center gap-1 rounded-[6px] border border-[#B7E6E6] bg-white px-2 py-0.5"
                          >
                            <code className="font-semibold text-primary">{key}</code>
                            <span className="text-[#9CA3AF]">= {label}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-[10px] border border-[#DCDCDC] p-3">
                  <label className="mb-1.5 block text-xs font-bold text-[#243333]">
                    หัวข้อ (Title)
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(event) => setFormTitle(event.target.value)}
                    disabled={saving}
                    className="h-9 w-full rounded-[8px] border border-[#DCDCDC] px-3 text-sm font-medium text-[#243333] outline-none transition-colors hover:border-primary focus:border-primary disabled:bg-gray-50 disabled:opacity-70"
                  />

                  <label className="mb-1.5 mt-3 block text-xs font-bold text-[#243333]">
                    รายละเอียด (Description)
                  </label>
                  <div className="relative">
                    <textarea
                      value={formDescription}
                      onChange={(event) => setFormDescription(event.target.value)}
                      disabled={saving}
                      maxLength={500}
                      rows={4}
                      className="w-full resize-none rounded-[8px] border border-[#DCDCDC] px-3 py-2.5 pr-20 text-sm font-medium leading-6 text-[#243333] outline-none transition-colors hover:border-primary focus:border-primary disabled:bg-gray-50 disabled:opacity-70"
                    />
                    <span className="absolute bottom-2.5 right-3 text-xs font-medium text-[#9CA3AF]">
                      {formDescription.length} / 500
                    </span>
                  </div>

                  {(formTitle || formDescription) && (
                    <div className="mt-4 rounded-[8px] border border-[#CDECEC] bg-[#F3FBFB] px-4 py-3">
                      <p className="mb-2 text-xs font-bold text-primary">ตัวอย่างที่ลูกค้าเห็น</p>
                      {formTitle && (
                        <p className="text-sm font-semibold text-[#243333]">
                          {applyPreview(formTitle, formDays)}
                        </p>
                      )}
                      {formDescription && (
                        <p className="mt-1 text-xs leading-5 text-[#565656]">
                          {applyPreview(formDescription, formDays)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {formError && <p className="text-sm text-[#F44034]">{formError}</p>}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="h-10 rounded-[10px] border border-[#DCDCDC] px-5 text-sm font-medium text-[#565656] transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !formDays.trim() || !formTitle.trim() || !formDescription.trim()}
                className="h-10 rounded-[10px] bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
