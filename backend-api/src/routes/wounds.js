const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { isDbConnectionError } = require("../db");
const {
  analyzeWoundWithOpenAI,
  isOpenAiConfigured
} = require("../services/openaiWoundAnalysis");
const { saveWoundCaseWithAnalysis } = require("../services/saveWoundAnalysis");

const PAIN_LEVELS = new Set(["none", "mild", "moderate", "severe"]);
const DURATIONS = new Set([
  "less_3_days",
  "3_7_days",
  "1_4_weeks",
  "more_4_weeks"
]);

function buildAnalysisResult(form) {
  const riskBoost =
    (form.painLevel === "severe" ? 20 : form.painLevel === "moderate" ? 12 : 0) +
    (form.hasFever ? 10 : 0) +
    (form.hasPus ? 15 : 0) +
    (form.hasSwelling ? 8 : 0);

  const riskScore = Math.min(95, Math.max(35, 58 + riskBoost));

  return {
    riskScore,
    riskTitle: "มีความเสี่ยงต่อการติดเชื้อผิวหนัง",
    disclaimer:
      "ผลลัพธ์นี้เป็นการประเมินเบื้องต้นจาก AI ไม่ใช่การวินิจฉัยทางการแพทย์ กรุณาพบแพทย์หากอาการไม่ดีขึ้น",
    warningNote:
      "หากมีไข้สูง ปวดรุนแรง หรือแผลขยายเร็ว ควรพบแพทย์ทันที",
    conditions: [
      {
        nameTh: "การติดเชื้อที่ผิวหนัง (Infected wound)",
        probability: riskScore
      },
      {
        nameTh: "ผื่นแพ้สัมผัส (Contact dermatitis)",
        probability: Math.max(12, Math.round(riskScore * 0.45))
      },
      {
        nameTh: "แผลกดทับระยะแรก (Pressure sore)",
        probability: Math.max(8, Math.round(riskScore * 0.22))
      }
    ],
    findings: [
      { label: "ผิวแดง", icon: "ellipse" },
      { label: "บวมเล็กน้อย", icon: "water-outline" },
      { label: "ชื้น/มีความชื้น", icon: "rainy-outline" },
      { label: "ขอบแผลไม่เรียบ", icon: "shapes-outline" }
    ],
    firstAid: [
      {
        step: 1,
        title: "ล้างมือให้สะอาด",
        description: "ล้างมือก่อนและหลังสัมผัสแผลทุกครั้ง"
      },
      {
        step: 2,
        title: "ทำความสะอาดแผล",
        description: "ใช้น้ำเกลือหรือน้ำสะอาดล้างแผลเบา ๆ"
      },
      {
        step: 3,
        title: "ปิดแผลด้วยผ้าก๊อซปลอดเชื้อ",
        description: "หลีกเลี่ยงการปิดแน่นเกินไป"
      },
      {
        step: 4,
        title: "หลีกเลี่ยงการเกา/บีบ/แกะ",
        description: "อย่าเกา บีบ หรือแกะแผล"
      },
      {
        step: 5,
        title: "สังเกตอาการอย่างใกล้ชิด",
        description: "หากอาการแย่ลง ให้พบแพทย์ทันที"
      }
    ],
    emergencyWarnings: [
      "ไข้สูงกว่า 38.5°C",
      "ปวดรุนแรงขึ้นเรื่อย ๆ",
      "แดง/บวมล spread เร็ว",
      "มีหนอง/น้ำเหลืองมาก"
    ]
  };
}

function parseForm(body) {
  const painLevel = PAIN_LEVELS.has(body.painLevel)
    ? body.painLevel
    : "moderate";
  const woundDuration = DURATIONS.has(body.woundDuration)
    ? body.woundDuration
    : "3_7_days";

  return {
    painLevel,
    woundDuration,
    woundLocation: String(body.woundLocation || "ขา - หน้าแข้ง (ด้านหน้า)"),
    hasFever: Boolean(body.hasFever),
    hasItching: Boolean(body.hasItching),
    hasSwelling: Boolean(body.hasSwelling),
    hasPus: Boolean(body.hasPus),
    additionalNote: String(body.additionalNote || ""),
    medications: String(body.medications || ""),
    conditions: Array.isArray(body.conditions) ? body.conditions : []
  };
}

function parsePhotos(body) {
  if (!Array.isArray(body.photos)) return [];

  return body.photos
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const data = String(item.data || "").replace(/^data:[^;]+;base64,/, "");
      if (!data) return null;
      return {
        mimeType: String(item.mimeType || "image/jpeg"),
        data
      };
    })
    .filter(Boolean)
    .slice(0, 3);
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    req.auth = null;
    return next();
  }

  return requireAuth(req, res, next);
}

async function saveWoundCase(db, req, payload) {
  return saveWoundCaseWithAnalysis(db, req, payload);
}

function createWoundsRouter({ db }) {
  const router = express.Router();

  router.post("/wound-cases/analyze", optionalAuth, async (req, res) => {
    try {
      const form = parseForm(req.body || {});
      const photos = parsePhotos(req.body || {});
      const fallback = buildAnalysisResult(form);

      let analysis = fallback;
      let aiSource = "rule_based";
      let aiModel = null;
      let aiNote = null;

      if (isOpenAiConfigured()) {
        try {
          const ai = await analyzeWoundWithOpenAI({ form, photos, fallback });
          analysis = ai.analysis;
          aiModel = ai.model;
          aiSource = photos.length ? "openai_vision" : "openai_text";
        } catch (aiErr) {
          const brief = String(aiErr.message || aiErr).split("\n")[0];
          console.error("[openai] wound analysis failed:", brief);
          aiSource = "rule_based_fallback";

          if (aiErr.code === "OPENAI_QUOTA_EXCEEDED") {
            aiNote =
              "โควตา OpenAI หมดแล้ว กรุณาเติมเครดิตที่ platform.openai.com — ใช้ผลประเมินเบื้องต้นแทน";
          } else if (aiErr.code === "OPENAI_AUTH_ERROR") {
            aiNote = "OpenAI API key ไม่ถูกต้อง — ใช้ผลประเมินเบื้องต้นแทน";
          }
        }
      }

      if (aiSource === "rule_based_fallback" && !aiNote) {
        aiNote = "AI ไม่พร้อมชั่วคราว ใช้ผลประเมินเบื้องต้นแทน";
      }

      let caseId = Date.now();
      let caseCode = `WC-${caseId}`;
      let analysisResultId = null;

      if (req.auth) {
        try {
          const saved = await saveWoundCase(db, req, {
            form,
            photos,
            analysis,
            meta: { aiSource, aiModel, aiNote }
          });
          caseId = saved.caseId;
          caseCode = saved.caseCode;
          analysisResultId = saved.analysisResultId;
        } catch (dbErr) {
          console.error("[mysql] wound case save failed:", dbErr.message);
          if (isDbConnectionError(dbErr)) {
            return res.status(503).json({
              error: "database_unavailable",
              message: "Cannot connect to MySQL"
            });
          }
        }
      }

      return res.status(201).json({
        caseId,
        caseCode,
        form,
        analysis,
        meta: {
          aiSource,
          aiModel,
          aiNote,
          photoCount: photos.length,
          analysisResultId
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "internal_error",
        message: "Analysis failed"
      });
    }
  });

  return router;
}

module.exports = { createWoundsRouter };
