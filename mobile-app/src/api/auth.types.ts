export type ApiMedicalProfile = {
  birthDate: string | null;
  gender: string;
  bloodType: string;
  weightKg: number | null;
  heightCm: number | null;
  hasDiabetes: boolean;
  hasHypertension: boolean;
  hasAllergy: boolean;
  hasSkinDisease: boolean;
  conditions: string[];
};

export type ApiUser = {
  id: number;
  fullName: string;
  username: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  userType: string;
  createdAt: string;
  lastLoginAt: string | null;
  medicalProfile?: ApiMedicalProfile;
};

export type AuthResponse = {
  token: string;
  user: ApiUser;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  gender: "male" | "female";
  weightKg: number;
  heightCm: number;
  bloodType: "A" | "B" | "AB" | "O" | "unknown";
  conditions: string[];
  acceptTerms: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UpdateProfilePayload = {
  fullName: string;
  birthDate: string;
  gender: "male" | "female";
  weightKg: number;
  heightCm: number;
  bloodType: "A" | "B" | "AB" | "O" | "unknown";
  conditions: string[];
};
