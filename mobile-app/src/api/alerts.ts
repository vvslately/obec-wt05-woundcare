import { http } from "./http";
import type { Alert } from "../types";

export async function fetchAlerts(params?: { deviceUid?: string; limit?: number }) {
  const { deviceUid, limit = 20 } = params || {};
  const res = await http.get<{ items: Alert[] }>("/api/v1/alerts", {
    params: { deviceUid, limit }
  });
  return res.data.items;
}

