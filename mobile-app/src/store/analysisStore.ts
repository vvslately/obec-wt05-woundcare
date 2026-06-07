import { create } from "zustand";
import {
  DEFAULT_ANALYSIS_FORM,
  DEMO_ANALYSIS,
  DEMO_HOSPITALS,
  type AnalysisForm,
  type AnalysisResultData,
  type HospitalItem
} from "../types/analysis";
import { analyzeWoundRequest } from "../api/wounds";
import { fetchHospitalsRequest } from "../api/hospitals";
import { getApiErrorMessage } from "../api/http";
import { photosToBase64 } from "../utils/photoBase64";
import { useAssessmentHistoryStore } from "./assessmentHistoryStore";

type AnalysisState = {
  photos: string[];
  selectedPhotoIndex: number;
  form: AnalysisForm;
  caseId: number | null;
  result: AnalysisResultData | null;
  aiSource: string | null;
  aiNote: string | null;
  hospitals: HospitalItem[];
  setPhotos: (photos: string[]) => void;
  setSelectedPhotoIndex: (index: number) => void;
  updateForm: (patch: Partial<AnalysisForm>) => void;
  resetFlow: () => void;
  submitAnalysis: () => Promise<
    { ok: true; message?: string } | { ok: false; message: string }
  >;
  loadHospitals: () => Promise<void>;
};

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  photos: [],
  selectedPhotoIndex: 0,
  form: DEFAULT_ANALYSIS_FORM,
  caseId: null,
  result: null,
  aiSource: null,
  aiNote: null,
  hospitals: [],

  setPhotos: (photos) =>
    set({
      photos,
      selectedPhotoIndex: Math.max(0, photos.length - 1)
    }),

  setSelectedPhotoIndex: (selectedPhotoIndex) => set({ selectedPhotoIndex }),

  updateForm: (patch) =>
    set((state) => ({
      form: { ...state.form, ...patch }
    })),

  resetFlow: () =>
    set({
      photos: [],
      selectedPhotoIndex: 0,
      form: DEFAULT_ANALYSIS_FORM,
      caseId: null,
      result: null,
      aiSource: null,
      aiNote: null
    }),

  submitAnalysis: async () => {
    const { form, photos } = get();

    try {
      const photoPayload = await photosToBase64(photos);
      const data = await analyzeWoundRequest(form, photoPayload);
      set({
        caseId: data.caseId,
        result: data.analysis,
        aiSource: data.meta?.aiSource ?? null,
        aiNote: data.meta?.aiNote ?? null
      });

      await useAssessmentHistoryStore.getState().addRecord({
        id: data.caseId,
        photoUri: photos[0] ?? null,
        woundLocation: form.woundLocation,
        riskScore: data.analysis.riskScore,
        riskTitle: data.analysis.riskTitle,
        form,
        result: data.analysis,
        photos,
        aiSource: data.meta?.aiSource ?? null
      });

      if (data.meta?.aiSource === "rule_based_fallback") {
        return {
          ok: true as const,
          message:
            data.meta.aiNote ||
            "AI ไม่พร้อมชั่วคราว ใช้ผลประเมินเบื้องต้นแทน"
        };
      }

      return { ok: true as const };
    } catch (error) {
      const offlineId = Date.now();
      set({
        caseId: offlineId,
        result: DEMO_ANALYSIS,
        aiSource: "offline_demo",
        aiNote: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ ใช้ข้อมูลตัวอย่าง"
      });

      await useAssessmentHistoryStore.getState().addRecord({
        id: offlineId,
        photoUri: photos[0] ?? null,
        woundLocation: form.woundLocation,
        riskScore: DEMO_ANALYSIS.riskScore,
        riskTitle: DEMO_ANALYSIS.riskTitle,
        form,
        result: DEMO_ANALYSIS,
        photos,
        aiSource: "offline_demo"
      });
      return { ok: true as const, message: getApiErrorMessage(error) };
    }
  },

  loadHospitals: async () => {
    try {
      const items = await fetchHospitalsRequest();
      set({ hospitals: items });
    } catch {
      set({ hospitals: DEMO_HOSPITALS });
    }
  }
}));
