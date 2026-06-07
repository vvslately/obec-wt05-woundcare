import Constants from "expo-constants";
import { Platform } from "react-native";

export function resolveBackendUrl(): string {
  const configured = (Constants.expoConfig?.extra as { BACKEND_URL?: string })
    ?.BACKEND_URL;

  if (configured && !configured.includes("localhost")) {
    return configured.replace(/\/$/, "");
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:4000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }

  return configured?.replace(/\/$/, "") || "http://localhost:4000";
}
