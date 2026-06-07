const express = require("express");
const bcrypt = require("bcryptjs");
const { signToken } = require("../lib/jwt");
const { requireAuth } = require("../middleware/auth");
const { isDbConnectionError } = require("../db");

const BCRYPT_ROUNDS = 10;

const CONDITION_MAP = {
  เบาหวาน: "has_diabetes",
  diabetes: "has_diabetes",
  ความดัน: "has_hypertension",
  hypertension: "has_hypertension",
  ภูมิแพ้: "has_allergy",
  allergy: "has_allergy",
  โรคผิวหนัง: "has_skin_disease",
  skin_disease: "has_skin_disease",
  ไม่มี: null
};

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function mapConditions(conditions = []) {
  const flags = {
    has_diabetes: 0,
    has_hypertension: 0,
    has_allergy: 0,
    has_skin_disease: 0
  };

  const list = Array.isArray(conditions) ? conditions : [];
  const onlyNone = list.length === 1 && list[0] === "ไม่มี";

  if (onlyNone) return flags;

  for (const item of list) {
    const key = CONDITION_MAP[item];
    if (key) flags[key] = 1;
  }

  return flags;
}

function toPublicUser(row, medical = null) {
  const user = {
    id: row.id,
    fullName: row.full_name,
    username: row.username,
    email: row.email,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    role: row.role,
    status: row.status,
    userType: row.role === "user" ? "ผู้ใช้งานทั่วไป" : row.role,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at
  };

  if (medical) {
    user.medicalProfile = {
      birthDate: medical.birth_date,
      gender: medical.gender,
      bloodType: medical.blood_type,
      weightKg: medical.weight_kg,
      heightCm: medical.height_cm,
      hasDiabetes: Boolean(medical.has_diabetes),
      hasHypertension: Boolean(medical.has_hypertension),
      hasAllergy: Boolean(medical.has_allergy),
      hasSkinDisease: Boolean(medical.has_skin_disease),
      conditions: buildConditionLabels(medical)
    };
  }

  return user;
}

function buildConditionLabels(medical) {
  const labels = [];
  if (medical.has_diabetes) labels.push("เบาหวาน");
  if (medical.has_hypertension) labels.push("ความดัน");
  if (medical.has_allergy) labels.push("ภูมิแพ้");
  if (medical.has_skin_disease) labels.push("โรคผิวหนัง");
  if (!labels.length) labels.push("ไม่มี");
  return labels;
}

async function fetchMedicalProfile(db, userId) {
  const [rows] = await db.query(
    `SELECT birth_date, gender, blood_type, weight_kg, height_cm,
            has_diabetes, has_hypertension, has_allergy, has_skin_disease
     FROM user_medical_profiles
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

function issueAuthResponse(row, medical) {
  const user = toPublicUser(row, medical);
  const token = signToken({
    sub: row.id,
    email: row.email,
    role: row.role
  });

  return { token, user };
}

function respondDbError(res, err) {
  console.error(err);

  if (isDbConnectionError(err)) {
    return res.status(503).json({
      error: "database_unavailable",
        message:
          "Cannot connect to MySQL. Check src/config/database.js and remote MySQL access"
    });
  }

  return res.status(500).json({
    error: "internal_error",
    message: "Database error"
  });
}

function createAuthRouter({ db }) {
  const router = express.Router();

  // POST /api/v1/auth/signup
  router.post("/auth/signup", async (req, res) => {
    let conn;

    try {
      conn = await db.getConnection();
    } catch (err) {
      return respondDbError(res, err);
    }

    try {
      const {
        fullName,
        email,
        password,
        confirmPassword,
        phone = null,
        conditions = [],
        acceptTerms = false
      } = req.body || {};

      const normalizedEmail = normalizeEmail(email);
      const name = String(fullName || "").trim();
      const pass = String(password || "");

      if (!name || !normalizedEmail || !pass) {
        return res.status(400).json({
          error: "validation_error",
          message: "fullName, email and password are required"
        });
      }

      if (confirmPassword !== undefined && pass !== String(confirmPassword)) {
        return res.status(400).json({
          error: "validation_error",
          message: "password confirmation does not match"
        });
      }

      if (pass.length < 6) {
        return res.status(400).json({
          error: "validation_error",
          message: "password must be at least 6 characters"
        });
      }

      if (!acceptTerms) {
        return res.status(400).json({
          error: "validation_error",
          message: "terms and privacy policy must be accepted"
        });
      }

      const [existing] = await conn.execute(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [normalizedEmail]
      );

      if (existing.length) {
        return res.status(409).json({
          error: "email_exists",
          message: "Email is already registered"
        });
      }

      const passwordHash = await bcrypt.hash(pass, BCRYPT_ROUNDS);
      const username = normalizedEmail.split("@")[0].slice(0, 100);
      const flags = mapConditions(conditions);

      await conn.beginTransaction();

      const [userResult] = await conn.execute(
        `INSERT INTO users
          (full_name, username, email, phone, password_hash, role, status)
         VALUES (?, ?, ?, ?, ?, 'user', 'active')`,
        [name, username, normalizedEmail, phone, passwordHash]
      );

      const userId = userResult.insertId;

      await conn.execute(
        `INSERT INTO user_medical_profiles
          (user_id, gender, blood_type, has_diabetes, has_hypertension, has_allergy, has_skin_disease)
         VALUES (?, 'not_specified', 'unknown', ?, ?, ?, ?)`,
        [
          userId,
          flags.has_diabetes,
          flags.has_hypertension,
          flags.has_allergy,
          flags.has_skin_disease
        ]
      );

      await conn.execute(
        `INSERT INTO user_settings (user_id) VALUES (?)`,
        [userId]
      );

      const consentRows = [
        ["terms", "1.0"],
        ["privacy_policy", "1.0"],
        ["health_data_storage", "1.0"],
        ["ai_analysis", "1.0"]
      ];

      for (const [consentType, version] of consentRows) {
        await conn.execute(
          `INSERT INTO user_consents (user_id, consent_type, is_accepted, version)
           VALUES (?, ?, 1, ?)`,
          [userId, consentType, version]
        );
      }

      await conn.execute(
        "UPDATE users SET last_login_at = NOW() WHERE id = ?",
        [userId]
      );

      await conn.commit();

      const [userRows] = await conn.execute(
        `SELECT id, full_name, username, email, phone, avatar_url, role, status, created_at, last_login_at
         FROM users WHERE id = ? LIMIT 1`,
        [userId]
      );

      const medical = await fetchMedicalProfile(
        { query: (...args) => conn.execute(...args) },
        userId
      );

      return res.status(201).json(issueAuthResponse(userRows[0], medical));
    } catch (err) {
      await conn.rollback().catch(() => {});
      return respondDbError(res, err);
    } finally {
      conn.release();
    }
  });

  // POST /api/v1/auth/login
  router.post("/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body || {};
      const normalizedEmail = normalizeEmail(email);
      const pass = String(password || "");

      if (!normalizedEmail || !pass) {
        return res.status(400).json({
          error: "validation_error",
          message: "email and password are required"
        });
      }

      const [rows] = await db.query(
        `SELECT id, full_name, username, email, phone, avatar_url, role, status,
                password_hash, created_at, last_login_at
         FROM users
         WHERE email = ? AND status = 'active'
         LIMIT 1`,
        [normalizedEmail]
      );

      if (!rows.length) {
        return res.status(401).json({
          error: "invalid_credentials",
          message: "Invalid email or password"
        });
      }

      const user = rows[0];
      const ok = await bcrypt.compare(pass, user.password_hash);

      if (!ok) {
        return res.status(401).json({
          error: "invalid_credentials",
          message: "Invalid email or password"
        });
      }

      await db.query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [user.id]);

      const medical = await fetchMedicalProfile(db, user.id);

      return res.json(issueAuthResponse(user, medical));
    } catch (err) {
      return respondDbError(res, err);
    }
  });

  // GET /api/v1/auth/me
  router.get("/auth/me", requireAuth, async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT id, full_name, username, email, phone, avatar_url, role, status, created_at, last_login_at
         FROM users
         WHERE id = ? AND status = 'active'
         LIMIT 1`,
        [req.auth.userId]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "not_found", message: "User not found" });
      }

      const medical = await fetchMedicalProfile(db, req.auth.userId);

      return res.json({ user: toPublicUser(rows[0], medical) });
    } catch (err) {
      return respondDbError(res, err);
    }
  });

  return router;
}

module.exports = { createAuthRouter };
