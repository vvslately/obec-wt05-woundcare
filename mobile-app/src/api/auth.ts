import { http } from "./http";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload
} from "./auth.types";

export async function loginRequest(payload: LoginPayload) {
  const { data } = await http.post<AuthResponse>("/api/v1/auth/login", payload);
  return data;
}

export async function signupRequest(payload: RegisterPayload) {
  const { data } = await http.post<AuthResponse>("/api/v1/auth/signup", payload);
  return data;
}

export async function fetchMeRequest() {
  const { data } = await http.get<{ user: AuthResponse["user"] }>("/api/v1/auth/me");
  return data.user;
}

export async function updateProfileRequest(payload: UpdateProfilePayload) {
  const { data } = await http.patch<{ user: AuthResponse["user"] }>(
    "/api/v1/auth/me",
    payload
  );
  return data.user;
}
