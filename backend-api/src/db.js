const mysql = require("mysql2/promise");
const dbConfig = require("./config/database");

const pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.on("error", (err) => {
  console.error("[mysql] pool error:", err.message);
});

async function testConnection() {
  const conn = await pool.getConnection();
  conn.release();
}

function isDbConnectionError(err) {
  if (!err) return false;
  if (err.code === "ECONNREFUSED" || err.code === "ER_ACCESS_DENIED_ERROR") {
    return true;
  }
  if (err.code === "ER_BAD_DB_ERROR") return true;
  if (Array.isArray(err.errors)) {
    return err.errors.some((item) => isDbConnectionError(item));
  }
  return false;
}

module.exports = {
  pool,
  testConnection,
  isDbConnectionError,
  async query(sql, params) {
    return pool.execute(sql, params);
  }
};
