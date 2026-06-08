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

function formatBirthDateForApi(value) {
  if (value == null) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const match = String(value).trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
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
      birthDate: formatBirthDateForApi(medical.birth_date),
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

const GENDERS = new Set(["male", "female"]);
const BLOOD_TYPES = new Set(["A", "B", "AB", "O", "unknown"]);

function parseBirthDate(value) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return { valid: false, birthDate: null };
  }

  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { valid: false, birthDate: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date > today) {
    return { valid: false, birthDate: null };
  }

  const minDate = new Date(today.getFullYear() - 120, 0, 1);
  if (date < minDate) {
    return { valid: false, birthDate: null };
  }

  return { valid: true, birthDate: text };
}

function parseMedicalInput(body) {
  const birth = parseBirthDate(body?.birthDate);
  const weightKg = Number(body?.weightKg);
  const heightCm = Number(body?.heightCm);
  const gender = GENDERS.has(body?.gender) ? body.gender : null;
  const bloodType = BLOOD_TYPES.has(body?.bloodType) ? body.bloodType : "unknown";

  return {
    birthDate: birth.birthDate,
    gender,
    bloodType,
    weightKg: Number.isFinite(weightKg) && weightKg > 0 ? weightKg : null,
    heightCm: Number.isFinite(heightCm) && heightCm > 0 ? heightCm : null,
    birthDateValid: birth.valid,
    weightValid: Number.isFinite(weightKg) && weightKg > 0 && weightKg <= 500,
    heightValid: Number.isFinite(heightCm) && heightCm > 0 && heightCm <= 250,
    bloodTypeValid: BLOOD_TYPES.has(body?.bloodType),
    genderValid: GENDERS.has(body?.gender)
  };
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
        birthDate,
        gender,
        weightKg,
        heightCm,
        bloodType,
        conditions = [],
        acceptTerms = false
      } = req.body || {};

      const normalizedEmail = normalizeEmail(email);
      const name = String(fullName || "").trim();
      const pass = String(password || "");
      const medicalInput = parseMedicalInput({
        birthDate,
        gender,
        weightKg,
        heightCm,
        bloodType
      });

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

      if (!medicalInput.birthDateValid) {
        return res.status(400).json({
          error: "validation_error",
          message: "birthDate is invalid"
        });
      }

      if (!medicalInput.genderValid) {
        return res.status(400).json({
          error: "validation_error",
          message: "gender is required"
        });
      }

      if (!medicalInput.weightValid) {
        return res.status(400).json({
          error: "validation_error",
          message: "weightKg is invalid"
        });
      }

      if (!medicalInput.heightValid) {
        return res.status(400).json({
          error: "validation_error",
          message: "heightCm is invalid"
        });
      }

      if (!medicalInput.bloodTypeValid) {
        return res.status(400).json({
          error: "validation_error",
          message: "bloodType is required"
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
          (user_id, birth_date, gender, blood_type, weight_kg, height_cm,
           has_diabetes, has_hypertension, has_allergy, has_skin_disease)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          medicalInput.birthDate,
          medicalInput.gender,
          medicalInput.bloodType,
          medicalInput.weightKg,
          medicalInput.heightCm,
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

  // PATCH /api/v1/auth/me
  router.patch("/auth/me", requireAuth, async (req, res) => {
    let conn;

    try {
      conn = await db.getConnection();
    } catch (err) {
      return respondDbError(res, err);
    }

    try {
      const {
        fullName,
        birthDate,
        gender,
        weightKg,
        heightCm,
        bloodType,
        conditions = []
      } = req.body || {};

      const name = String(fullName || "").trim();
      const medicalInput = parseMedicalInput({
        birthDate,
        gender,
        weightKg,
        heightCm,
        bloodType
      });

      if (!name) {
        return res.status(400).json({
          error: "validation_error",
          message: "fullName is required"
        });
      }

      if (!medicalInput.birthDateValid) {
        return res.status(400).json({
          error: "validation_error",
          message: "birthDate is invalid"
        });
      }

      if (!medicalInput.genderValid) {
        return res.status(400).json({
          error: "validation_error",
          message: "gender is required"
        });
      }

      if (!medicalInput.weightValid) {
        return res.status(400).json({
          error: "validation_error",
          message: "weightKg is invalid"
        });
      }

      if (!medicalInput.heightValid) {
        return res.status(400).json({
          error: "validation_error",
          message: "heightCm is invalid"
        });
      }

      if (!medicalInput.bloodTypeValid) {
        return res.status(400).json({
          error: "validation_error",
          message: "bloodType is required"
        });
      }

      const flags = mapConditions(conditions);

      await conn.beginTransaction();

      await conn.execute(
        `UPDATE users SET full_name = ?, updated_at = NOW() WHERE id = ? AND status = 'active'`,
        [name, req.auth.userId]
      );

      const [existingMedical] = await conn.execute(
        `SELECT id FROM user_medical_profiles WHERE user_id = ? LIMIT 1`,
        [req.auth.userId]
      );

      if (existingMedical.length) {
        await conn.execute(
          `UPDATE user_medical_profiles
           SET birth_date = ?, gender = ?, blood_type = ?, weight_kg = ?, height_cm = ?,
               has_diabetes = ?, has_hypertension = ?, has_allergy = ?, has_skin_disease = ?,
               updated_at = NOW()
           WHERE user_id = ?`,
          [
            medicalInput.birthDate,
            medicalInput.gender,
            medicalInput.bloodType,
            medicalInput.weightKg,
            medicalInput.heightCm,
            flags.has_diabetes,
            flags.has_hypertension,
            flags.has_allergy,
            flags.has_skin_disease,
            req.auth.userId
          ]
        );
      } else {
        await conn.execute(
          `INSERT INTO user_medical_profiles
            (user_id, birth_date, gender, blood_type, weight_kg, height_cm,
             has_diabetes, has_hypertension, has_allergy, has_skin_disease)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.auth.userId,
            medicalInput.birthDate,
            medicalInput.gender,
            medicalInput.bloodType,
            medicalInput.weightKg,
            medicalInput.heightCm,
            flags.has_diabetes,
            flags.has_hypertension,
            flags.has_allergy,
            flags.has_skin_disease
          ]
        );
      }

      await conn.commit();

      const [userRows] = await conn.execute(
        `SELECT id, full_name, username, email, phone, avatar_url, role, status, created_at, last_login_at
         FROM users WHERE id = ? LIMIT 1`,
        [req.auth.userId]
      );

      if (!userRows.length) {
        return res.status(404).json({ error: "not_found", message: "User not found" });
      }

      const medical = await fetchMedicalProfile(
        { query: (...args) => conn.execute(...args) },
        req.auth.userId
      );

      return res.json({ user: toPublicUser(userRows[0], medical) });
    } catch (err) {
      await conn.rollback().catch(() => {});
      return respondDbError(res, err);
    } finally {
      conn.release();
    }
  });

  return router;
}

module.exports = { createAuthRouter };
