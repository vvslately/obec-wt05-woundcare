const express = require("express");

function createAlertsRouter({ db, io }) {
  const router = express.Router();

  // POST /api/v1/events/thief
  // Body:
  // {
  //   deviceUid: string,
  //   alertType?: "THIEF_DETECTED",
  //   severity?: number (1-5),
  //   confidence?: number (0-1),
  //   occurredAt?: string (ISO),
  //   metadata?: object
  // }
  router.post("/events/thief", async (req, res) => {
    try {
      const {
        deviceUid,
        alertType = "THIEF_DETECTED",
        severity = 3,
        confidence = null,
        occurredAt = new Date().toISOString(),
        metadata = {}
      } = req.body || {};

      if (!deviceUid) {
        return res.status(400).json({ error: "deviceUid is required" });
      }

      const [deviceRows] = await db.query(
        "SELECT id, user_id FROM devices WHERE device_uid = ? LIMIT 1",
        [deviceUid]
      );

      if (!deviceRows?.length) {
        return res.status(404).json({ error: "device not found" });
      }

      const device = deviceRows[0];
      const userId = device.user_id;

      const [result] = await db.query(
        `INSERT INTO alerts
          (device_id, user_id, alert_type, severity, confidence, occurred_at, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          device.id,
          userId,
          alertType,
          severity,
          confidence,
          occurredAt.slice(0, 19).replace("T", " "),
          JSON.stringify(metadata)
        ]
      );

      const alertId = result.insertId;

      const alert = {
        id: alertId,
        deviceUid,
        alertType,
        severity,
        confidence,
        occurredAt,
        metadata
      };

      // Push real-time to the user's room
      io.to(`user:${userId}`).emit("thiefAlert", alert);

      return res.status(201).json({ alertId, alert });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "internal_error" });
    }
  });

  // GET /api/v1/alerts?deviceUid=...&limit=20
  router.get("/alerts", async (req, res) => {
    try {
      const { deviceUid = null, limit = "20" } = req.query;
      const n = Math.max(1, Math.min(Number(limit) || 20, 100));

      if (deviceUid) {
        const [deviceRows] = await db.query(
          "SELECT id FROM devices WHERE device_uid = ? LIMIT 1",
          [deviceUid]
        );
        if (!deviceRows?.length) return res.json({ items: [] });
        const deviceId = deviceRows[0].id;

        const [rows] = await db.query(
          `SELECT id, alert_type, severity, confidence, occurred_at, metadata
           FROM alerts
           WHERE device_id = ?
           ORDER BY occurred_at DESC
           LIMIT ?`,
          [deviceId, n]
        );

        return res.json({
          items: rows.map((r) => ({
            id: r.id,
            alertType: r.alert_type,
            severity: r.severity,
            confidence: r.confidence,
            occurredAt: r.occurred_at,
            metadata: r.metadata ? JSON.parse(r.metadata) : {}
          }))
        });
      }

      // Fallback: last alerts (demo)
      const [rows] = await db.query(
        `SELECT id, device_id, alert_type, severity, confidence, occurred_at, metadata
         FROM alerts
         ORDER BY occurred_at DESC
         LIMIT ?`,
        [n]
      );

      return res.json({
        items: rows.map((r) => ({
          id: r.id,
          deviceId: r.device_id,
          alertType: r.alert_type,
          severity: r.severity,
          confidence: r.confidence,
          occurredAt: r.occurred_at,
          metadata: r.metadata ? JSON.parse(r.metadata) : {}
        }))
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "internal_error" });
    }
  });

  return router;
}

module.exports = { createAlertsRouter };

