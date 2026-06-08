export function isOpenAiSource(aiSource: string | null | undefined) {
  return aiSource === "openai_vision" || aiSource === "openai_text";
}

export function formatAiModelLabel(model: string | null | undefined) {
  if (!model) return "ChatGPT";

  const normalized = model.toLowerCase();
  if (normalized.includes("gpt-4o")) return "GPT-4o";
  if (normalized.includes("gpt-4.1")) return "GPT-4.1";
  if (normalized.includes("gpt-4")) return "GPT-4";
  if (normalized.includes("gpt-3.5")) return "GPT-3.5";

  return model;
}

export function getAiSourceDescription(aiSource: string | null | undefined) {
  switch (aiSource) {
    case "openai_vision":
      return "วิเคราะห์จากรูปแผล + อาการ";
    case "openai_text":
      return "วิเคราะห์จากอาการที่กรอก";
    default:
      return null;
  }
}

export function buildAiMetaSummary(
  aiSource: string | null | undefined,
  aiModel: string | null | undefined,
  aiNote?: string | null
) {
  if (!isOpenAiSource(aiSource)) return null;

  const lines = [
    `โมเดล: ${formatAiModelLabel(aiModel)}`,
    getAiSourceDescription(aiSource) ?? "วิเคราะห์ด้วย ChatGPT"
  ];

  if (aiNote?.trim()) {
    lines.push(aiNote.trim());
  }

  return lines.join("\n");
}
