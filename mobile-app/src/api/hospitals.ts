import { http } from "./http";
import type { HospitalItem } from "../types/analysis";

type HospitalsResponse = {
  items: HospitalItem[];
};

export async function fetchHospitalsRequest() {
  const { data } = await http.get<HospitalsResponse>("/api/v1/hospitals");
  return data.items;
}
