import { create } from "zustand";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: "analysis" | "follow_up" | "warning" | "system";
};

type NotificationsSheetState = {
  visible: boolean;
  items: AppNotification[];
  open: () => void;
  close: () => void;
  setItems: (items: AppNotification[]) => void;
  mergeItems: (items: AppNotification[]) => void;
  markAllRead: () => void;
};

export const useNotificationsSheetStore = create<NotificationsSheetState>(
  (set, get) => ({
    visible: false,
    items: [
      {
        id: "welcome",
        title: "ยินดีต้อนรับสู่ WoundCare AI",
        message: "เริ่มถ่ายรูปแผลเพื่อรับการประเมินความเสี่ยงเบื้องต้นได้ทันที",
        createdAt: new Date().toISOString(),
        read: false,
        type: "system"
      }
    ],

    open: () => set({ visible: true }),

    close: () => set({ visible: false }),

    setItems: (items) => set({ items }),

    mergeItems: (incoming) => {
      set((state) => {
        const readMap = new Map(state.items.map((item) => [item.id, item.read]));
        return {
          items: incoming.map((item) => ({
            ...item,
            read: readMap.get(item.id) ?? item.read
          }))
        };
      });
    },

    markAllRead: () => {
      const items = get().items.map((item) => ({ ...item, read: true }));
      set({ items });
    }
  })
);

export function getUnreadNotificationCount(items: AppNotification[]) {
  return items.filter((item) => !item.read).length;
}
