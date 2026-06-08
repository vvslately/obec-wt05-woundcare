function parseJson(value, fallback = []) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mapConditionRow(row) {
  const nameTh = row.condition_name_en
    ? `${row.condition_name_th} (${row.condition_name_en})`
    : row.condition_name_th;
  return {
    nameTh,
    probability: Math.round(Number(row.probability) || 0)
  };
}

async function loadAnalysisBundle(db, analysisResultId) {
  if (!analysisResultId) return null;

  const [[analysis]] = await db.query(
    `SELECT id, ai_source, ai_model, ai_note, risk_score, risk_title,
            disclaimer, warning_note, findings, emergency_warnings
     FROM ai_analysis_results
     WHERE id = ?`,
    [analysisResultId]
  );

  if (!analysis) return null;

  const [conditionRows] = await db.query(
    `SELECT condition_name_th, condition_name_en, probability
     FROM ai_possible_conditions
     WHERE analysis_result_id = ?
     ORDER BY probability DESC`,
    [analysisResultId]
  );

  const [firstAidRows] = await db.query(
    `SELECT title, description, step_order, is_warning
     FROM first_aid_recommendations
     WHERE analysis_result_id = ? AND is_warning = 0
     ORDER BY step_order ASC`,
    [analysisResultId]
  );

  const findings = parseJson(analysis.findings, []);
  const emergencyFromJson = parseJson(analysis.emergency_warnings, []);

  const [warningRows] = await db.query(
    `SELECT title FROM first_aid_recommendations
     WHERE analysis_result_id = ? AND is_warning = 1`,
    [analysisResultId]
  );

  const emergencyWarnings =
    emergencyFromJson.length > 0
      ? emergencyFromJson
      : warningRows.map((row) => row.title);

  return {
    meta: {
      aiSource: analysis.ai_source,
      aiModel: analysis.ai_model,
      aiNote: analysis.ai_note,
      analysisResultId: analysis.id
    },
    analysis: {
      riskScore: Math.round(Number(analysis.risk_score) || 0),
      riskTitle: analysis.risk_title,
      disclaimer: analysis.disclaimer || "",
      warningNote: analysis.warning_note || "",
      conditions: conditionRows.map(mapConditionRow),
      findings,
      firstAid: firstAidRows.map((row, index) => ({
        step: Number(row.step_order) || index + 1,
        title: row.title,
        description: row.description || ""
      })),
      emergencyWarnings
    }
  };
}

async function listWoundCasesForUser(db, userId, limit = 20) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);

  const [rows] = await db.query(
    `SELECT
        wc.id,
        wc.case_code,
        wc.title,
        wc.wound_location,
        wc.wound_duration,
        wc.created_at,
        ar.id AS analysis_result_id,
        ar.risk_score,
        ar.risk_title,
        (
          SELECT wi.image_url
          FROM wound_images wi
          WHERE wi.wound_case_id = wc.id
          ORDER BY wi.id ASC
          LIMIT 1
        ) AS thumbnail_url
     FROM wound_cases wc
     LEFT JOIN ai_analysis_results ar ON ar.id = (
       SELECT id FROM ai_analysis_results
       WHERE wound_case_id = wc.id
       ORDER BY created_at DESC
       LIMIT 1
     )
     WHERE wc.user_id = ?
     ORDER BY wc.created_at DESC
     LIMIT ${safeLimit}`,
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    caseCode: row.case_code,
    title: row.title || row.wound_location || "การประเมินแผล",
    woundLocation: row.wound_location,
    woundDuration: row.wound_duration,
    riskScore: row.risk_score != null ? Math.round(Number(row.risk_score)) : null,
    riskTitle: row.risk_title,
    thumbnailUrl: row.thumbnail_url,
    createdAt: row.created_at
  }));
}

async function getWoundCaseDetail(db, userId, caseId) {
  const [[wc]] = await db.query(
    `SELECT id, case_code, title, wound_location, wound_duration, user_note, created_at
     FROM wound_cases
     WHERE id = ? AND user_id = ?`,
    [caseId, userId]
  );

  if (!wc) return null;

  const [[symptoms]] = await db.query(
    `SELECT pain_level, has_fever, has_itching, has_swelling, has_pus, additional_note
     FROM wound_symptoms
     WHERE wound_case_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    [caseId]
  );

  const [imageRows] = await db.query(
    `SELECT image_url FROM wound_images
     WHERE wound_case_id = ?
     ORDER BY id ASC`,
    [caseId]
  );

  const [[latestAnalysis]] = await db.query(
    `SELECT id FROM ai_analysis_results
     WHERE wound_case_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [caseId]
  );

  const bundle = await loadAnalysisBundle(db, latestAnalysis?.id);
  if (!bundle) return null;

  const form = {
    painLevel: symptoms?.pain_level || "moderate",
    hasFever: Boolean(symptoms?.has_fever),
    hasItching: Boolean(symptoms?.has_itching),
    hasSwelling: Boolean(symptoms?.has_swelling),
    hasPus: Boolean(symptoms?.has_pus),
    woundDuration: wc.wound_duration || "3_7_days",
    woundLocation: wc.wound_location || "",
    additionalNote: symptoms?.additional_note || wc.user_note || "",
    medications: "",
    conditions: []
  };

  return {
    caseId: wc.id,
    caseCode: wc.case_code,
    createdAt: wc.created_at,
    form,
    photos: imageRows.map((row) => row.image_url),
    analysis: bundle.analysis,
    meta: bundle.meta
  };
}

async function deleteWoundCaseForUser(db, userId, caseId) {
  const [result] = await db.query(
    `DELETE FROM wound_cases WHERE id = ? AND user_id = ?`,
    [caseId, userId]
  );

  return result.affectedRows > 0;
}

module.exports = {
  listWoundCasesForUser,
  getWoundCaseDetail,
  deleteWoundCaseForUser
};
