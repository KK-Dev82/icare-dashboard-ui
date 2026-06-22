"use client";

import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/api/auth";
import iciLogo from "@/../assets/ici.png";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authApi.login({ username, password });
      if (res.success) {
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("fullName", res.data.fullName);
        localStorage.setItem("role", res.data.role);
        router.push("/dashboard");
      } else {
        setError(res.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4FAFA]">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <Image
            src={iciLogo}
            alt="ICI Logo"
            width={238}
            height={91}
            className="h-[91px] w-[238px] object-contain"
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-[24px] border border-[#EAEAEA] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-10">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-[#243333]">เข้าสู่ระบบ</h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              กรอกข้อมูลเพื่อเข้าใช้งานระบบจัดการ
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#FDECEC] text-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              size="lg"
              className="w-full"
              label="ชื่อผู้ใช้"
              type="text"
              placeholder="กรอกชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <div className="relative w-full">
              <Input
                size="lg"
                className="w-full"
                label="รหัสผ่าน"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#DCDCDC] text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-[#565656]">จดจำการเข้าสู่ระบบ</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                ลืมรหัสผ่าน?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] rounded-xl bg-primary text-white font-medium text-base hover:bg-primary/90 transition-all hover:shadow-[0_4px_12px_rgba(7,162,162,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          © 2570 iCare Insurance. All rights reserved.
        </p>
      </div>
    </div>
  );
}
