import { http } from "./http";
import type { AnalysisForm, AnalysisResultData } from "../types/analysis";
import type { PhotoPayload } from "../utils/photoBase64";

type AnalyzeResponse = {
  caseId: number;
  caseCode: string;
  form: AnalysisForm;
  analysis: AnalysisResultData;
  meta?: {
    aiSource?: string;
    aiModel?: string | null;
    aiNote?: string | null;
    photoCount?: number;
  };
};

export async function analyzeWoundRequest(
  form: AnalysisForm,
  photos: PhotoPayload[] = []
) {
  const { data } = await http.post<AnalyzeResponse>(
    "/api/v1/wound-cases/analyze",
    { ...form, photos },
    { timeout: 90_000 }
  );
  return data;
}
