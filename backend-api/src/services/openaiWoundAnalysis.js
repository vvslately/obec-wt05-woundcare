const OpenAI = require("openai");
const { OPENAI_API_KEY, OPENAI_MODEL, isOpenAiConfigured } = require("../config/openai");
const {
  buildPrompt,
  normalizeAnalysis,
  parseJsonResponse
} = require("./woundAnalysisShared");

function buildUserContent(form, photos) {
  const content = [{ type: "text", text: buildPrompt(form) }];

  for (const photo of photos || []) {
    if (!photo?.data) continue;
    const mimeType = photo.mimeType || "image/jpeg";
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${mimeType};base64,${photo.data}`,
        detail: "high"
      }
    });
  }

  return content;
}

function getAiErrorCode(error) {
  const message = String(error?.message || error || "").toLowerCase();
  const status = error?.status || error?.response?.status;

  if (status === 401 || message.includes("invalid api key")) {
    return "OPENAI_AUTH_ERROR";
  }
  if (
    status === 429 ||
    message.includes("insufficient_quota") ||
    message.includes("exceeded your current quota")
  ) {
    return "OPENAI_QUOTA_EXCEEDED";
  }
  if (status === 503 || message.includes("overloaded")) {
    return "OPENAI_UNAVAILABLE";
  }
  return "OPENAI_FAILED";
}

async function analyzeWoundWithOpenAI({ form, photos, fallback }) {
  if (!isOpenAiConfigured()) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey: OPENAI_API_KEY });

  try {
    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a wound-care triage assistant. Respond with valid JSON only, in Thai where appropriate."
        },
        {
          role: "user",
          content: buildUserContent(form, photos)
        }
      ]
    });

    const text = response.choices?.[0]?.message?.content || "";
    const parsed = parseJsonResponse(text);

    if (!parsed) {
      throw new Error("OpenAI returned invalid JSON");
    }

    return {
      analysis: normalizeAnalysis(parsed, fallback),
      model: response.model || OPENAI_MODEL
    };
  } catch (error) {
    const wrapped = new Error(String(error.message || error).split("\n")[0]);
    wrapped.code = getAiErrorCode(error);
    throw wrapped;
  }
}

module.exports = {
  analyzeWoundWithOpenAI,
  isOpenAiConfigured
};
