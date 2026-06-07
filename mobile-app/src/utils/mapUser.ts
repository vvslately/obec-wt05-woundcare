import type { ApiUser } from "../api/auth.types";
import type { UserProfile } from "../store/authStore";

const GENDER_LABELS: Record<string, string> = {
  male: "ชาย",
  female: "หญิง",
  other: "อื่นๆ",
  not_specified: "-"
};

function calcAge(birthDate: string | null | undefined): number {
  if (!birthDate) return 0;

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return Math.max(age, 0);
}

export function mapApiUserToProfile(apiUser: ApiUser): UserProfile {
  const medical = apiUser.medicalProfile;

  return {
    id: apiUser.id,
    name: apiUser.fullName,
    email: apiUser.email,
    userType: apiUser.userType || "ผู้ใช้งานทั่วไป",
    age: calcAge(medical?.birthDate),
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
