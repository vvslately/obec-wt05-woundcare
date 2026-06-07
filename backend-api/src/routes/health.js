const express = require("express");
const { testConnection } = require("../db");

function createHealthRouter() {
  const router = express.Router();

  router.get("/health", async (req, res) => {
    try {
      await testConnection();
      return res.json({ ok: true, database: "connected" });
    } catch (err) {
      return res.status(503).json({
        ok: false,
        database: "disconnected",
        message:
          "MySQL is not reachable. Check src/config/database.js and remote MySQL access"
      });
    }
  });

  return router;
}

module.exports = { createHealthRouter };
