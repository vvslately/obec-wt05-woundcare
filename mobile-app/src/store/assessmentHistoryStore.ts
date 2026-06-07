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
};

type AssessmentHistoryState = {
  items: AssessmentRecord[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addRecord: (input: Omit<AssessmentRecord, "id" | "createdAt"> & { id?: number }) => Promise<void>;
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
    const items = await readStorage();
    set({ items, isHydrated: true });
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
      aiSource: input.aiSource
    };

    const next = [record, ...get().items.filter((item) => item.id !== record.id)].slice(
      0,
      MAX_ITEMS
    );
    await writeStorage(next);
    set({ items: next, isHydrated: true });
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
