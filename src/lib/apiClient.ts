import axios from "axios";
import { clearAuthSession } from "@/lib/authStorage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

if (typeof window !== "undefined") {
  console.log("[apiClient] BASE_URL:", BASE_URL || "(empty - will use relative URL)");
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.errorCode;

    if (typeof window !== "undefined") {
      const shouldLogout =
        status === 401 ||
        errorCode === "ROLE_INACTIVE" ||
        (status === 403 && errorCode === "ROLE_NOT_FOUND");

      if (shouldLogout) {
        clearAuthSession();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    if (!error.response) {
      error.message = "ไม่สามารถเชื่อมต่อระบบได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
    } else if (error.response.status >= 500) {
      error.message = "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง";
    }
    return Promise.reject(error);
  }
);
