export type Alert = {
  id: number;
  deviceUid?: string;
  deviceId?: number;
  alertType: string;
  severity: number;
  confidence: number | null;
  occurredAt: string; // ISO
  metadata: Record<string, any>;
};

