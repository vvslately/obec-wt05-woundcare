const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || "";
const GOOGLE_AI_MODEL = process.env.GOOGLE_AI_MODEL || "gemini-2.5-flash";

const DEFAULT_MODEL_FALLBACKS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

function parseModelList(value) {
  if (!value || !String(value).trim()) return DEFAULT_MODEL_FALLBACKS;
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const GOOGLE_AI_MODELS = parseModelList(process.env.GOOGLE_AI_MODELS);

function isGoogleAiConfigured() {
  return Boolean(GOOGLE_AI_API_KEY.trim());
}

module.exports = {
  GOOGLE_AI_API_KEY,
  GOOGLE_AI_MODEL,
  GOOGLE_AI_MODELS,
  isGoogleAiConfigured
};
