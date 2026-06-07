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

  return router;
}

module.exports = { createHospitalsRouter };
