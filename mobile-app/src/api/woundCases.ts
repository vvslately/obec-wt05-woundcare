import { http } from "./http";
import type { AnalysisForm, AnalysisResultData } from "../types/analysis";

export type WoundCaseSummary = {
  id: number;
  caseCode: string;
  title: string;
  woundLocation: string | null;
  woundDuration: string | null;
  riskScore: number | null;
  riskTitle: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
};

export type WoundCaseDetail = {
  caseId: number;
  caseCode: string;
  createdAt: string;
  form: AnalysisForm;
  photos: string[];
  analysis: AnalysisResultData;
  meta?: {
    aiSource?: string | null;
    aiModel?: string | null;
    aiNote?: string | null;
    analysisResultId?: number;
  };
};

export async function fetchWoundCasesRequest(limit = 20) {
  const { data } = await http.get<{ items: WoundCaseSummary[] }>(
    "/api/v1/wound-cases",
    { params: { limit } }
  );
  return data.items;
}

export async function fetchWoundCaseDetailRequest(caseId: number) {
  const { data } = await http.get<WoundCaseDetail>(
    `/api/v1/wound-cases/${caseId}`
  );
  return data;
}

export async function deleteWoundCaseRequest(caseId: number) {
  await http.delete(`/api/v1/wound-cases/${caseId}`);
}
