const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { isDbConnectionError } = require("../db");

function createHospitalsRouter({ db }) {
  const router = express.Router();

  router.get("/hospitals", async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT id, name, address, phone, website, latitude, longitude,
                hospital_type, is_24_hours, has_emergency, has_dermatology, has_wound_care
         FROM hospitals
         ORDER BY name ASC`
      );

      const demoDistances = [2.4, 4.8, 6.1];
      const demoMinutes = [8, 15, 19];

      return res.json({
        items: rows.map((row, index) => ({
          id: row.id,
          name: row.name,
          address: row.address,
          phone: row.phone,
          website: row.website,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          hospitalType: row.hospital_type,
          is24Hours: Boolean(row.is_24_hours),
          hasEmergency: Boolean(row.has_emergency),
          hasDermatology: Boolean(row.has_dermatology),
          hasWoundCare: Boolean(row.has_wound_care),
          distanceKm: demoDistances[index] ?? 5 + index,
          etaMinutes: demoMinutes[index] ?? 10 + index * 3
        }))
      });
    } catch (err) {
      console.error(err);
      if (isDbConnectionError(err)) {
        return res.status(503).json({
          error: "database_unavailable",
          message: "Cannot connect to MySQL"
        });
      }
      return res.status(500).json({ error: "internal_error" });
    }
  });

  router.get("/saved-hospitals", requireAuth, async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT
            h.id,
            h.name,
            h.address,
            h.phone,
            h.latitude,
            h.longitude,
            sh.created_at AS saved_at
         FROM saved_hospitals sh
         INNER JOIN hospitals h ON h.id = sh.hospital_id
         WHERE sh.user_id = ?
         ORDER BY sh.created_at DESC`,
        [req.auth.userId]
      );

      return res.json({
        items: rows.map((row, index) => ({
          id: row.id,
          name: row.name,
          address: row.address,
          phone: row.phone,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          savedAt: row.saved_at,
          distanceKm: null,
          etaMinutes: null
        }))
      });
    } catch (err) {
      console.error(err);
      if (isDbConnectionError(err)) {
        return res.status(503).json({
          error: "database_unavailable",
          message: "Cannot connect to MySQL"
        });
      }
      return res.status(500).json({ error: "internal_error" });
    }
  });

  router.post("/saved-hospitals", requireAuth, async (req, res) => {
    try {
      const hospitalId = Number(req.body?.hospitalId);
      if (!Number.isFinite(hospitalId)) {
        return res.status(400).json({ error: "invalid_hospital_id" });
      }

      const [[hospital]] = await db.query(
        "SELECT id FROM hospitals WHERE id = ?",
        [hospitalId]
      );
      if (!hospital) {
        return res.status(404).json({ error: "hospital_not_found" });
      }

      await db.query(
        `INSERT INTO saved_hospitals (user_id, hospital_id)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
        [req.auth.userId, hospitalId]
      );

      return res.status(201).json({ ok: true, hospitalId });
    } catch (err) {
      console.error(err);
      if (isDbConnectionError(err)) {
        return res.status(503).json({
          error: "database_unavailable",
          message: "Cannot connect to MySQL"
        });
      }
      return res.status(500).json({ error: "internal_error" });
    }
  });

  return router;
}

module.exports = { createHospitalsRouter };
