function splitConditionName(nameTh) {
  const text = String(nameTh || "").trim();
  const match = text.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return { th: match[1].trim(), en: match[2].trim() };
  }
  return { th: text, en: null };
}

function photoToImageUrl(photo) {
  if (!photo?.data) return null;
  const mimeType = photo.mimeType || "image/jpeg";
  const dataUrl = `data:${mimeType};base64,${photo.data}`;
  if (dataUrl.length > 1_500_000) return null;
  return dataUrl;
}

async function saveWoundCaseWithAnalysis(db, req, input) {
  const { form, photos = [], analysis, meta = {} } = input;
  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const caseCode = `WC-${Date.now()}`;
    const title = form.woundLocation || "การประเมินแผล";

    const [caseResult] = await conn.execute(
      `INSERT INTO wound_cases
        (user_id, case_code, title, wound_location, wound_body_part, wound_duration, status, user_note)
       VALUES (?, ?, ?, ?, 'leg', ?, 'analyzed', ?)`,
      [
        req.auth.userId,
        caseCode,
        title,
        form.woundLocation,
        form.woundDuration,
        form.additionalNote || null
      ]
    );

    const caseId = caseResult.insertId;

    await conn.execute(
      `INSERT INTO wound_symptoms
        (wound_case_id, pain_level, has_fever, has_itching, has_swelling, has_pus, additional_note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        caseId,
        form.painLevel,
        form.hasFever ? 1 : 0,
        form.hasItching ? 1 : 0,
        form.hasSwelling ? 1 : 0,
        form.hasPus ? 1 : 0,
        form.additionalNote || null
      ]
    );

    for (const photo of photos.slice(0, 3)) {
      const imageUrl = photoToImageUrl(photo);
      if (!imageUrl) continue;

      await conn.execute(
        `INSERT INTO wound_images
          (wound_case_id, image_url, image_type, mime_type, file_size_bytes)
         VALUES (?, ?, 'original', ?, ?)`,
        [
          caseId,
          imageUrl,
          photo.mimeType || "image/jpeg",
          Math.round((photo.data.length * 3) / 4)
        ]
      );
    }

    const [analysisResult] = await conn.execute(
      `INSERT INTO ai_analysis_results
        (wound_case_id, ai_source, ai_model, ai_note, risk_score, risk_title, disclaimer, warning_note, findings, emergency_warnings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        caseId,
        meta.aiSource || "rule_based",
        meta.aiModel || null,
        meta.aiNote || null,
        analysis.riskScore,
        analysis.riskTitle,
        analysis.disclaimer || null,
        analysis.warningNote || null,
        JSON.stringify(analysis.findings || []),
        JSON.stringify(analysis.emergencyWarnings || [])
      ]
    );

    const analysisResultId = analysisResult.insertId;

    for (const condition of analysis.conditions || []) {
      const { th, en } = splitConditionName(condition.nameTh);
      await conn.execute(
        `INSERT INTO ai_possible_conditions
          (analysis_result_id, condition_name_th, condition_name_en, probability)
         VALUES (?, ?, ?, ?)`,
        [analysisResultId, th, en, condition.probability ?? null]
      );
    }

    for (const step of analysis.firstAid || []) {
      await conn.execute(
        `INSERT INTO first_aid_recommendations
          (analysis_result_id, title, description, step_order, is_warning)
         VALUES (?, ?, ?, ?, 0)`,
        [
          analysisResultId,
          step.title,
          step.description || "",
          Number(step.step) || 1
        ]
      );
    }

    for (const warning of analysis.emergencyWarnings || []) {
      await conn.execute(
        `INSERT INTO first_aid_recommendations
          (analysis_result_id, title, description, step_order, is_warning)
         VALUES (?, ?, ?, 99, 1)`,
        [analysisResultId, String(warning), String(warning)]
      );
    }

    await conn.commit();
    return { caseId, caseCode, analysisResultId };
  } catch (err) {
    if (conn) await conn.rollback().catch(() => {});
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  saveWoundCaseWithAnalysis
};
