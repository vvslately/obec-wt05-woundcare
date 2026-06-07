import * as FileSystem from "expo-file-system/legacy";

export type PhotoPayload = {
  mimeType: string;
  data: string;
};

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".heic")) return "image/heic";
  return "image/jpeg";
}

export async function photoUriToBase64(uri: string): Promise<PhotoPayload | null> {
  if (!uri) return null;

  try {
    const data = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64"
    });

    if (!data) return null;

    return {
      mimeType: guessMimeType(uri),
      data
    };
  } catch {
    return null;
  }
}

export async function photosToBase64(uris: string[]): Promise<PhotoPayload[]> {
  const results = await Promise.all(uris.map((uri) => photoUriToBase64(uri)));
  return results.filter((item): item is PhotoPayload => item !== null);
}
