import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { AnalysisForm, AnalysisResultData } from "../types/analysis";

const STORAGE_KEY = "woundcare.assessment.history";
const MAX_ITEMS = 30;

export type AssessmentRecord = {
  id: number;
  createdAt: string;
  photoUri: string | null;
  woundLocation: string;
  riskScore: number;
  riskTitle: string;
  form: AnalysisForm;
  result: AnalysisResultData;
  photos: string[];
  aiSource: string | null;
  aiModel?: string | null;
  aiNote?: string | null;
};

type AssessmentHistoryState = {
  items: AssessmentRecord[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  addRecord: (input: Omit<AssessmentRecord, "id" | "createdAt"> & { id?: number }) => Promise<void>;
  updateRecordPhotos: (id: number, photos: string[]) => Promise<void>;
  removeRecord: (id: number) => Promise<void>;
  getLatest: () => AssessmentRecord | null;
};

async function readStorage(): Promise<AssessmentRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStorage(items: AssessmentRecord[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const useAssessmentHistoryStore = create<AssessmentHistoryState>((set, get) => ({
  items: [],
  isHydrated: false,

  hydrate: async () => {
    if (get().isHydrated) {
      return;
    }
    await get().refresh();
  },

  refresh: async () => {
    try {
      const items = await readStorage();
      set({ items, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  addRecord: async (input) => {
    const record: AssessmentRecord = {
      id: input.id ?? Date.now(),
      createdAt: new Date().toISOString(),
      photoUri: input.photoUri,
      woundLocation: input.woundLocation,
      riskScore: input.riskScore,
      riskTitle: input.riskTitle,
      form: input.form,
      result: input.result,
      photos: input.photos,
      aiSource: input.aiSource,
      aiModel: input.aiModel ?? null,
      aiNote: input.aiNote ?? null
    };

    const next = [record, ...get().items.filter((item) => item.id !== record.id)].slice(
      0,
      MAX_ITEMS
    );

    set({ items: next, isHydrated: true });

    try {
      await writeStorage(next);
    } catch {
      // Keep in-memory history even if persistence fails.
    }
  },

  updateRecordPhotos: async (id, photos) => {
    const next = get().items.map((item) =>
      item.id === id
        ? {
            ...item,
            photos,
            photoUri: photos[0] ?? null
          }
        : item
    );

    set({ items: next, isHydrated: true });

    try {
      await writeStorage(next);
    } catch {
      // Keep in-memory history even if persistence fails.
    }
  },

  removeRecord: async (id) => {
    const next = get().items.filter((item) => item.id !== id);

    set({ items: next, isHydrated: true });

    try {
      await writeStorage(next);
    } catch {
      // Keep in-memory history even if persistence fails.
    }
  },

  getLatest: () => get().items[0] ?? null
}));

export function getRiskStatusLabel(riskScore: number): string {
  if (riskScore >= 75) return "ควรพบแพทย์";
  if (riskScore >= 55) return "ควรสังเกตอาการใกล้ชิด";
  return "ความเสี่ยงต่ำ";
}

export function formatThaiShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
