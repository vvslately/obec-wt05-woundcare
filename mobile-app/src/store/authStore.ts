import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { fetchMeRequest, loginRequest, signupRequest } from "../api/auth";
import { getApiErrorMessage, setHttpAuthToken } from "../api/http";
import { mapApiUserToProfile } from "../utils/mapUser";

const TOKEN_KEY = "woundcare.auth.token";

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  userType: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  bloodType: string;
  conditions: string[];
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  conditions: string[];
};

type AuthResult = { ok: true } | { ok: false; message: string };

type AuthState = {
  user: UserProfile | null;
  token: string | null;
  isHydrating: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
};

async function persistToken(token: string | null) {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isHydrating: true,

  login: async (email, password, remember = true) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      return { ok: false, message: "กรุณากรอกอีเมลและรหัสผ่าน" };
    }

    try {
      const data = await loginRequest({
        email: trimmedEmail,
        password
      });

      set({
        user: mapApiUserToProfile(data.user),
        token: data.token
      });
      setHttpAuthToken(data.token);

      if (remember) {
        await persistToken(data.token);
      } else {
        await persistToken(null);
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error) };
    }
  },

  register: async (input) => {
    const name = input.name.trim();
    const email = input.email.trim();

    if (!name || !email || !input.password || !input.confirmPassword) {
      return { ok: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" };
    }

    if (input.password !== input.confirmPassword) {
      return { ok: false, message: "รหัสผ่านไม่ตรงกัน" };
    }

    if (input.password.length < 6) {
      return { ok: false, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
    }

    try {
      const data = await signupRequest({
        fullName: name,
        email,
        password: input.password,
        confirmPassword: input.confirmPassword,
        conditions: input.conditions,
        acceptTerms: true
      });

      set({
        user: mapApiUserToProfile(data.user),
        token: data.token
      });
      setHttpAuthToken(data.token);

      await persistToken(data.token);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error) };
    }
  },

  restoreSession: async () => {
    set({ isHydrating: true });

    try {
      const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        setHttpAuthToken(null);
        set({ user: null, token: null, isHydrating: false });
        return;
      }

      set({ token: savedToken });
      setHttpAuthToken(savedToken);

      const apiUser = await fetchMeRequest();
      set({
        user: mapApiUserToProfile(apiUser),
        token: savedToken,
        isHydrating: false
      });
    } catch {
      await persistToken(null);
      setHttpAuthToken(null);
      set({ user: null, token: null, isHydrating: false });
    }
  },

  logout: async () => {
    await persistToken(null);
    setHttpAuthToken(null);
    set({ user: null, token: null });
  }
}));
