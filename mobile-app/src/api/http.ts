import axios from "axios";
import { resolveBackendUrl } from "../config/backend";

export const http = axios.create({
  baseURL: resolveBackendUrl(),
  timeout: 15_000
});

let authToken: string | null = null;

export function setHttpAuthToken(token: string | null) {
  authToken = token;
}

http.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "เกิดข้อผิดพลาด กรุณาลองใหม่";
  }

  const message = error.response?.data?.message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (error.code === "ECONNABORTED") {
    return "หมดเวลาเชื่อมต่อเซิร์ฟเวอร์";
  }

  if (!error.response) {
    return "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ ตรวจสอบว่า backend เปิดอยู่";
  }

  return "เกิดข้อผิดพลาด กรุณาลองใหม่";
}
