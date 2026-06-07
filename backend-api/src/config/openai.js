const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function isOpenAiConfigured() {
  return Boolean(OPENAI_API_KEY.trim());
}

module.exports = {
  OPENAI_API_KEY,
  OPENAI_MODEL,
  isOpenAiConfigured
};
