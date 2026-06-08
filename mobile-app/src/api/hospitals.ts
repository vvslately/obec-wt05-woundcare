import { http } from "./http";
import type { HospitalItem } from "../types/analysis";

type HospitalsResponse = {
  items: HospitalItem[];
};

export type SavedHospitalItem = HospitalItem & {
  savedAt: string;
};

export async function fetchHospitalsRequest() {
  const { data } = await http.get<HospitalsResponse>("/api/v1/hospitals");
  return data.items;
}

export async function fetchSavedHospitalsRequest() {
  const { data } = await http.get<{ items: SavedHospitalItem[] }>(
    "/api/v1/saved-hospitals"
  );
  return data.items;
}

export async function saveHospitalRequest(hospitalId: number) {
  await http.post("/api/v1/saved-hospitals", { hospitalId });
}
