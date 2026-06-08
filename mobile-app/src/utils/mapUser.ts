import type { ApiUser } from "../api/auth.types";
import type { UserProfile } from "../store/authStore";

const GENDER_LABELS: Record<string, string> = {
  male: "ชาย",
  female: "หญิง",
  other: "อื่นๆ",
  not_specified: "-"
};

function normalizeBirthDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const match = String(value).trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function parseBirthDateParts(iso: string | null | undefined) {
  const normalized = normalizeBirthDate(iso);
  if (!normalized) return null;

  const [year, month, day] = normalized.split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;

  return { year, month, day, date };
}

const THAI_DAY_MONTH: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  calendar: "gregory"
};

export function formatBirthDateLabel(iso: string | null | undefined): string {
  const parts = parseBirthDateParts(iso);
  if (!parts) return "-";

  return parts.date.toLocaleDateString("th-TH", THAI_DAY_MONTH);
}

export function formatBirthDateCompact(iso: string | null | undefined): string {
  const parts = parseBirthDateParts(iso);
  if (!parts) return "-";

  const monthLabel = parts.date.toLocaleDateString("th-TH", {
    month: "short",
    calendar: "gregory"
  });

  return `${parts.day} ${monthLabel}`;
}

export function mapApiUserToProfile(apiUser: ApiUser): UserProfile {
  const medical = apiUser.medicalProfile;

  return {
    id: apiUser.id,
    name: apiUser.fullName,
    email: apiUser.email,
    userType: apiUser.userType || "ผู้ใช้งานทั่วไป",
    birthDate: normalizeBirthDate(medical?.birthDate) ?? null,
    gender: GENDER_LABELS[medical?.gender || ""] || medical?.gender || "-",
    weight: Number(medical?.weightKg) || 0,
    height: Number(medical?.heightCm) || 0,
    bloodType:
      !medical?.bloodType || medical.bloodType === "unknown"
        ? "-"
        : medical.bloodType,
    conditions: medical?.conditions?.length ? medical.conditions : ["ไม่มี"]
  };
}

export function profileGenderToApi(
  gender: string
): "male" | "female" | "" {
  if (gender === "ชาย" || gender === "male") return "male";
  if (gender === "หญิง" || gender === "female") return "female";
  return "";
}

export function profileBloodTypeToApi(
  bloodType: string
): "A" | "B" | "AB" | "O" | "unknown" | "" {
  if (bloodType === "-" || bloodType === "ไม่ทราบ") return "unknown";
  if (bloodType === "A" || bloodType === "B" || bloodType === "AB" || bloodType === "O") {
    return bloodType;
  }
  return "";
}

export function parseBirthDateFromIso(iso: string | null | undefined): Date | null {
  const parts = parseBirthDateParts(iso);
  return parts?.date ?? null;
}
