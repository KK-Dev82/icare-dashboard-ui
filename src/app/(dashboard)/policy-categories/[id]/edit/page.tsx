"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { userApi } from "@/api/user";
import { PageBackHeader } from "@/components/layout/PageBackHeader";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AdminUserRole } from "@/types/user";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [username, setUsername] = useState("");
  const [role, setRole] = useState<AdminUserRole | "">("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    userApi
      .getById(id)
      .then((res) => {
        if (res.success) {
          const [first = "", ...rest] = (res.data.fullName || "").split(" ");
          setUsername(res.data.username);
          setRole(res.data.role);
          setFirstName(first);
          setLastName(rest.join(" "));
          setEmail(res.data.email || "");
          setError("");
        } else {
          setError(res.message || "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
        }
      })
      .catch(() => {
        setError("ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
      })
      .finally(() => {
        setFetching(false);
      });
  }, [id]);

  const isValid = () =>
    !!(username && role && firstName && lastName && email) &&
    (!password || password === confirmPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValid()) {
      setError(
        password && password !== confirmPassword
          ? "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน"
          : "กรุณากรอกข้อมูลให้ครบถ้วน"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await userApi.update(id, {
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        role: role as AdminUserRole,
        ...(password ? { password } : {}),
      });

      if (res.success) {
        router.push("/policy-categories");
      } else {
        setError(res.message || "ไม่สามารถแก้ไขผู้ใช้งานได้");
      }
    } catch {
      setError("ไม่สามารถแก้ไขผู้ใช้งานได้");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="text-sm text-[#9CA3AF]">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div>
      <PageBackHeader
        title="แก้ไขผู้ใช้งาน"
        description="แก้ไขข้อมูลผู้ใช้งานได้ในไม่กี่ขั้นตอน"
        onBack={() => router.back()}
      />

      <div className="mx-auto w-full max-w-3xl rounded-[18px] border border-[#EAEAEA] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-8 lg:p-10">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2">
            <Input
              size="lg"
              className="w-full"
              label="ชื่อผู้ใช้งาน"
              placeholder=""
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled
            />
            <Select
              size="lg"
              className="w-full"
              label="ประเภทผู้ใช้งาน"
              placeholder="เลือกประเภท"
              value={role}
              onChange={(value) => setRole(value as AdminUserRole)}
              options={[
                { label: "admin", value: "SUPER_ADMIN" },
                { label: "user", value: "ADMIN" },
              ]}
            />
            <Input
              size="lg"
              className="w-full"
              label="ชื่อ"
              placeholder=""
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              size="lg"
              className="w-full"
              label="นามสกุล"
              placeholder=""
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <div className="md:col-span-2">
              <Input
                size="lg"
                className="w-full"
                label="อีเมล"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <PasswordInput
              label="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordInput
              label="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="mt-5 rounded-lg bg-[#FDECEC] px-4 py-3 text-sm text-[#F44034]">
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="h-[44px] w-[150px] rounded-[6px] bg-[#24A148] text-sm font-medium text-white transition-colors hover:bg-[#1e8e3e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="h-[44px] w-[150px] rounded-[6px] bg-[#C9C9C9] text-sm font-medium text-white"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function PasswordInput({ label, value, onChange }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[14px] font-bold text-dark">
        {label}
      </label>
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="h-[56px] w-full rounded-xl border border-[#DCDCDC] bg-white px-[22px] pr-12 text-base text-[#565656] outline-none placeholder:text-[#B7B7B7] transition-all duration-200 hover:border-primary hover:shadow-[0_4px_12px_rgba(7,162,162,0.08)] focus:border-primary"
      />
      <button
        type="button"
        onClick={() => setShowPassword((current) => !current)}
        className="absolute right-5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[#C9C9C9] transition-colors hover:text-primary"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
