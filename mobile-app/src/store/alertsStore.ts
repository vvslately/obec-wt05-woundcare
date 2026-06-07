import { create } from "zustand";
import type { Alert } from "../types";

export type AlertsState = {
  items: Alert[];
  setItems: (items: Alert[]) => void;
  push: (item: Alert) => void;
};

export const useAlertsStore = create<AlertsState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  push: (item) =>
    set((s) => ({
      items: [item, ...s.items].slice(0, 50)
    }))
}));

