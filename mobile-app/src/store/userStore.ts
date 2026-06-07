import { create } from "zustand";

export type UserState = {
  userId: number | null;
  setUserId: (id: number) => void;
};

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  setUserId: (id) => set({ userId: id })
}));

