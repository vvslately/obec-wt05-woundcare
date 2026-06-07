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

const JSON_SCHEMA_HINT = `{
  "riskScore": 0-100,
  "riskTitle": "string",
  "disclaimer": "string",
  "warningNote": "string",
  "conditions": [{ "nameTh": "string", "probability": 0-100 }],
  "findings": [{ "label": "string", "icon": "ellipse" }],
  "firstAid": [{ "step": 1, "title": "string", "description": "string" }],
  "emergencyWarnings": ["string"]
}`;

function buildPrompt(form) {
  return `คุณเป็นผู้ช่วยประเมินแผลเบื้องต้นสำหรับแอป WoundCare AI (ไม่ใช่การวินิจฉัยทางการแพทย์)

วิเคราะห์จากภาพแผลที่แนบมา (ถ้ามี) ร่วมกับข้อมูลอาการด้านล่าง แล้วตอบเป็น JSON เท่านั้น

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
6. disclaimer และ warningNote เป็นภาษาไทย ระบุว่าเป็นการประเมินเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์

รูปแบบ JSON:
${JSON_SCHEMA_HINT}`;
}

function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
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

module.exports = {
  buildPrompt,
  normalizeAnalysis,
  parseJsonResponse
};
