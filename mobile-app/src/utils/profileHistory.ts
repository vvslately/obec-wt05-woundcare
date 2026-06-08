import type { WoundCaseSummary } from "../api/woundCases";
import type { AssessmentRecord } from "../store/assessmentHistoryStore";

export type ProfileHistoryItem = {
  id: number;
  woundLocation: string;
  title: string;
  riskScore: number | null;
  riskTitle: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  localRecord?: AssessmentRecord;
};

export function buildProfileHistory(
  localItems: AssessmentRecord[],
  serverItems: WoundCaseSummary[]
): ProfileHistoryItem[] {
  const serverIds = new Set(serverItems.map((item) => item.id));

  const fromServer: ProfileHistoryItem[] = serverItems.map((item) => ({
    id: item.id,
    woundLocation: item.woundLocation || item.title || "การประเมินแผล",
    title: item.title || item.woundLocation || "การประเมินแผล",
    riskScore: item.riskScore,
    riskTitle: item.riskTitle,
    thumbnailUrl: item.thumbnailUrl,
    createdAt: item.createdAt
  }));

  const fromLocal: ProfileHistoryItem[] = localItems
    .filter((item) => !serverIds.has(item.id))
    .map((item) => ({
      id: item.id,
      woundLocation: item.woundLocation || "การประเมินแผล",
      title: item.woundLocation || "การประเมินแผล",
      riskScore: item.riskScore,
      riskTitle: item.riskTitle,
      thumbnailUrl: item.photoUri,
      createdAt: item.createdAt,
      localRecord: item
    }));

  return [...fromServer, ...fromLocal].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
