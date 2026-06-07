require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const dbConfig = require("./config/database");
const { pool } = require("./db");
const { createHealthRouter } = require("./routes/health");
const { createAlertsRouter } = require("./routes/alerts");
const { createAuthRouter } = require("./routes/auth");
const { createHospitalsRouter } = require("./routes/hospitals");
const { createWoundsRouter } = require("./routes/wounds");
const { registerSocketHandlers } = require("./sockets");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    credentials: true
  })
);
app.use(express.json({ limit: "15mb" }));

app.get("/api/v1", (req, res) => {
  res.json({ name: "obec-thief-detector", version: "1.0.0" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*"
  }
});

app.use("/api/v1", createHealthRouter());
app.use(
  "/api/v1",
  createAuthRouter({
    db: {
      query: pool.execute.bind(pool),
      getConnection: pool.getConnection.bind(pool)
    }
  })
);
app.use(
  "/api/v1",
  createHospitalsRouter({
    db: { query: pool.execute.bind(pool) }
  })
);
app.use(
  "/api/v1",
  createWoundsRouter({
    db: {
      query: pool.execute.bind(pool),
      getConnection: pool.getConnection.bind(pool)
    }
  })
);
app.use(
  "/api/v1",
  createAlertsRouter({
    db: { query: pool.execute.bind(pool) },
    io
  })
);

registerSocketHandlers({ io });

const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, async () => {
  console.log(`backend-api listening on http://localhost:${PORT}`);

  try {
    await pool.execute("SELECT 1");
    console.log(
      `[mysql] connected to ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`
    );
  } catch (err) {
    console.error(
      "[mysql] NOT connected — check src/config/database.js and remote MySQL access"
    );
    console.error(`[mysql] ${err.message}`);
  }
});

