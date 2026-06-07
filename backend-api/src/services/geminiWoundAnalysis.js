const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  GOOGLE_AI_API_KEY,
  GOOGLE_AI_MODEL,
  GOOGLE_AI_MODELS,
  isGoogleAiConfigured
} = require("../config/googleAi");

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    riskScore: { type: "integer", minimum: 0, maximum: 100 },
    riskTitle: { type: "string" },
    disclaimer: { type: "string" },
    warningNote: { type: "string" },
    conditions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nameTh: { type: "string" },
          probability: { type: "integer", minimum: 0, maximum: 100 }
        },
        required: ["nameTh", "probability"]
      }
    },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          icon: { type: "string" }
        },
        required: ["label", "icon"]
      }
    },
    firstAid: {
      type: "array",
      items: {
        type: "object",
        properties: {
          step: { type: "integer" },
          title: { type: "string" },
          description: { type: "string" }
        },
        required: ["step", "title", "description"]
      }
    },
    emergencyWarnings: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: [
    "riskScore",
    "riskTitle",
    "disclaimer",
    "warningNote",
    "conditions",
    "findings",
    "firstAid",
    "emergencyWarnings"
  ]
};

const VALID_ICONS = new Set([
  "ellipse",
  "water-outline",
  "rainy-outline",
  "shapes-outline",
  "thermometer-outline",
  "alert-circle-outline",
  "bandage-outline",
  "medkit-outline",
  "eye-outline",
  "hand-left-outline"
]);

function buildPrompt(form) {
  return `คุณเป็นผู้ช่วยประเมินแผลเบื้องต้นสำหรับแอป WoundCare AI (ไม่ใช่การวินิจฉัยทางการแพทย์)

วิเคราะห์จากภาพแผลที่แนบมา ร่วมกับข้อมูลอาการด้านล่าง แล้วตอบเป็น JSON เท่านั้น

ข้อมูลอาการ:
- ระดับความเจ็บปวด: ${form.painLevel}
- มีไข้: ${form.hasFever ? "ใช่" : "ไม่"}
- คัน: ${form.hasItching ? "ใช่" : "ไม่"}
- บวม: ${form.hasSwelling ? "ใช่" : "ไม่"}
- มีน้ำเหลือง/หนอง: ${form.hasPus ? "ใช่" : "ไม่"}
- ระยะเวลาเป็นแผล: ${form.woundDuration}
- ตำแหน่งแผล: ${form.woundLocation}
- โรคประจำตัว: ${(form.conditions || []).join(", ") || "ไม่ระบุ"}
- อาการเพิ่มเติม: ${form.additionalNote || "ไม่มี"}
- ยา/แพ้ยา: ${form.medications || "ไม่มี"}

ข้อกำหนด:
1. riskScore เป็นคะแนนความเสี่ยง 0-100 จากภาพและอาการ
2. conditions ให้ 3 รายการ เรียงจากความเป็นไปได้สูงสุด probability 0-100
3. findings ให้ 4 รายการ สิ่งที่เห็นจากภาพ (ภาษาไทย) พร้อม icon จาก Ionicons: ellipse, water-outline, rainy-outline, shapes-outline, thermometer-outline, alert-circle-outline, bandage-outline, medkit-outline, eye-outline, hand-left-outline
4. firstAid ให้ 5 ขั้นตอนการปฐมพยาบาลเบื้องต้น (ภาษาไทย)
5. emergencyWarnings ให้ 4 อาการที่ควรพบแพทย์ทันที (ภาษาไทย)
6. disclaimer และ warningNote เป็นภาษาไทย ระบุว่าเป็นการประเมินเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์`;
}

function normalizeAnalysis(raw, fallback) {
  const source = raw && typeof raw === "object" ? raw : {};

  const conditions = Array.isArray(source.conditions)
    ? source.conditions
        .filter((item) => item && item.nameTh)
        .slice(0, 3)
        .map((item) => ({
          nameTh: String(item.nameTh),
          probability: clampPercent(item.probability)
        }))
    : fallback.conditions;

  const findings = Array.isArray(source.findings)
    ? source.findings
        .filter((item) => item && item.label)
        .slice(0, 4)
        .map((item) => ({
          label: String(item.label),
          icon: VALID_ICONS.has(item.icon) ? item.icon : "ellipse"
        }))
    : fallback.findings;

  const firstAid = Array.isArray(source.firstAid)
    ? source.firstAid
        .filter((item) => item && item.title)
        .slice(0, 5)
        .map((item, index) => ({
          step: Number(item.step) || index + 1,
          title: String(item.title),
          description: String(item.description || "")
        }))
    : fallback.firstAid;

  const emergencyWarnings = Array.isArray(source.emergencyWarnings)
    ? source.emergencyWarnings.map(String).filter(Boolean).slice(0, 6)
    : fallback.emergencyWarnings;

  return {
    riskScore: clampPercent(source.riskScore ?? fallback.riskScore),
    riskTitle: String(source.riskTitle || fallback.riskTitle),
    disclaimer: String(source.disclaimer || fallback.disclaimer),
    warningNote: String(source.warningNote || fallback.warningNote),
    conditions: conditions.length ? conditions : fallback.conditions,
    findings: findings.length ? findings : fallback.findings,
    firstAid: firstAid.length ? firstAid : fallback.firstAid,
    emergencyWarnings: emergencyWarnings.length
      ? emergencyWarnings
      : fallback.emergencyWarnings
  };
}

function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function parseJsonResponse(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function getModelCandidates() {
  const preferred = [GOOGLE_AI_MODEL, ...GOOGLE_AI_MODELS];
  return [...new Set(preferred.filter(Boolean))];
}

function isBillingDepletedError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return message.includes("prepayment credits are depleted");
}

function isQuotaBlockedError(error) {
  const message = String(error?.message || error || "");
  return (
    isBillingDepletedError(error) ||
    message.includes("limit: 0") ||
    message.includes("Quota exceeded")
  );
}

function isHighDemandError(error) {
  const message = String(error?.message || error || "");
  return message.includes("[503") || message.includes("high demand");
}

function getGeminiFailureReason(error) {
  if (isBillingDepletedError(error)) return "credits_depleted";
  if (isHighDemandError(error)) return "high_demand";
  if (isQuotaBlockedError(error)) return "quota_exceeded";
  return "unknown";
}

function isRetryableGeminiError(error) {
  const message = String(error?.message || error || "");
  if (isQuotaBlockedError(error) || isBillingDepletedError(error)) {
    return false;
  }
  return (
    message.includes("[503") ||
    message.includes("[500") ||
    message.includes("high demand") ||
    message.includes("Resource exhausted") ||
    message.includes("UNAVAILABLE")
  );
}

function getRetryDelayMs(error, attempt) {
  const message = String(error?.message || error || "");
  const match = message.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (match) {
    return Math.min(45000, Math.ceil(Number(match[1]) * 1000) + 500);
  }
  if (isHighDemandError(error)) {
    return Math.min(20000, 2000 * 2 ** attempt);
  }
  return 1500 * (attempt + 1);
}

function shortError(error) {
  return String(error?.message || error || "")
    .split("\n")[0]
    .trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildContentParts(form, photos) {
  const parts = [{ text: buildPrompt(form) }];

  for (const photo of photos || []) {
    if (!photo?.data) continue;
    parts.push({
      inlineData: {
        mimeType: photo.mimeType || "image/jpeg",
        data: photo.data
      }
    });
  }

  return parts;
}

async function generateWithModel(modelName, parts) {
  const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.35,
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA
    }
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts }]
  });

  const text = result.response.text();
  const parsed = parseJsonResponse(text);

  if (!parsed) {
    throw new Error("Gemini returned invalid JSON");
  }

  return parsed;
}

async function analyzeWoundWithGemini({ form, photos, fallback }) {
  if (!isGoogleAiConfigured()) {
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  }

  const parts = buildContentParts(form, photos);
  const models = getModelCandidates();
  const errors = [];
  const maxAttempts = 5;
  let failureReason = "unknown";

  for (const modelName of models) {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const parsed = await generateWithModel(modelName, parts);
        return {
          analysis: normalizeAnalysis(parsed, fallback),
          model: modelName
        };
      } catch (error) {
        const brief = shortError(error);
        failureReason = getGeminiFailureReason(error);
        errors.push(`${modelName}: ${brief}`);
        console.error(
          `[gemini] ${modelName} attempt ${attempt + 1}/${maxAttempts} failed:`,
          brief
        );

        if (isBillingDepletedError(error)) {
          const billingError = new Error(brief);
          billingError.code = "GEMINI_CREDITS_DEPLETED";
          throw billingError;
        }

        if (isQuotaBlockedError(error)) {
          break;
        }

        if (isRetryableGeminiError(error) && attempt < maxAttempts - 1) {
          await sleep(getRetryDelayMs(error, attempt));
          continue;
        }

        break;
      }
    }
  }

  const aggregate = new Error(errors[0] || "Gemini analysis failed");
  aggregate.code =
    failureReason === "high_demand"
      ? "GEMINI_HIGH_DEMAND"
      : failureReason === "quota_exceeded"
        ? "GEMINI_QUOTA_EXCEEDED"
        : "GEMINI_FAILED";
  throw aggregate;
}

module.exports = {
  analyzeWoundWithGemini,
  isGoogleAiConfigured
};
