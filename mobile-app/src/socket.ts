import io, { Socket } from "socket.io-client";
import Constants from "expo-constants";
import type { Alert } from "./types";

const backendUrl =
  (Constants.expoConfig?.extra as any)?.BACKEND_URL ||
  "http://localhost:4000";

export type SocketHandlers = {
  onAlert: (alert: Alert) => void;
};

export function connectSocket(userId: number, handlers: SocketHandlers): Socket {
  const socket = io(backendUrl, {
    transports: ["websocket"]
  });

  socket.on("connect", () => {
    socket.emit("register", { userId });
  });

  socket.on("thiefAlert", (alert: Alert) => {
    handlers.onAlert(alert);
  });

  return socket;
}

