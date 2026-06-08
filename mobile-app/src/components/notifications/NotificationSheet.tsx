import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  formatThaiShortDate,
  useAssessmentHistoryStore
} from "../../store/assessmentHistoryStore";
import {
  getUnreadNotificationCount,
  useNotificationsSheetStore,
  type AppNotification
} from "../../store/notificationsSheetStore";
import { colors } from "../../theme/colors";
import { radius, spacing } from "../../theme/spacing";

const SLIDE_DURATION = 320;

function iconForType(type: AppNotification["type"]) {
  switch (type) {
    case "analysis":
      return "document-text-outline";
    case "warning":
      return "warning-outline";
    case "follow_up":
      return "calendar-outline";
    default:
      return "notifications-outline";
  }
}

function iconColorForType(type: AppNotification["type"]) {
  switch (type) {
    case "warning":
      return colors.notification;
    case "analysis":
      return colors.brand;
    case "follow_up":
      return colors.accent;
    default:
      return colors.link;
  }
}

function iconBgForType(type: AppNotification["type"]) {
  switch (type) {
    case "warning":
      return colors.warningBg;
    case "analysis":
      return colors.infoBg;
    case "follow_up":
      return colors.accentSoft;
    default:
      return colors.statusCardBg;
  }
}

type NotificationSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function NotificationSheet({ visible, onClose }: NotificationSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const items = useNotificationsSheetStore((s) => s.items);
  const mergeItems = useNotificationsSheetStore((s) => s.mergeItems);
  const markAllRead = useNotificationsSheetStore((s) => s.markAllRead);
  const historyItems = useAssessmentHistoryStore((s) => s.items);

  const sheetMaxHeight = Math.min(windowHeight * 0.78, 620);
  const sheetTranslateY = useRef(new Animated.Value(sheetMaxHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);

  const historyNotifications = useMemo<AppNotification[]>(
    () =>
      historyItems.slice(0, 5).map((item) => ({
        id: `analysis-${item.id}`,
        title: "ผลวิเคราะห์แผลพร้อมแล้ว",
        message: `${item.woundLocation || "แผล"} — ความเสี่ยง ${item.riskScore}% (${item.riskTitle})`,
        createdAt: item.createdAt,
        read: false,
        type: "analysis" as const
      })),
    [historyItems]
  );

  useEffect(() => {
    const welcome: AppNotification = {
      id: "welcome",
      title: "ยินดีต้อนรับสู่ WoundCare AI",
      message: "เริ่มถ่ายรูปแผลเพื่อรับการประเมินความเสี่ยงเบื้องต้นได้ทันที",
      createdAt: new Date().toISOString(),
      read: false,
      type: "system"
    };

    mergeItems([...historyNotifications, welcome]);
  }, [historyNotifications, mergeItems]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    closingRef.current = false;
    sheetTranslateY.setValue(sheetMaxHeight);
    backdropOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();

    markAllRead();
  }, [backdropOpacity, markAllRead, sheetMaxHeight, sheetTranslateY, visible]);

  const handleClose = () => {
    if (closingRef.current) {
      return;
    }
    closingRef.current = true;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(sheetTranslateY, {
        toValue: sheetMaxHeight,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      })
    ]).start(({ finished }) => {
      closingRef.current = false;
      if (finished) {
        onClose();
      }
    });
  };

  const unreadCount = getUnreadNotificationCount(items);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdropPressable} onPress={handleClose}>
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: sheetMaxHeight,
              paddingBottom: Math.max(insets.bottom, spacing.md),
              transform: [{ translateY: sheetTranslateY }]
            }
          ]}
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>การแจ้งเตือน</Text>
              <Text style={styles.subtitle}>
                {items.length
                  ? `${items.length} รายการ${unreadCount ? ` • ${unreadCount} ยังไม่อ่าน` : ""}`
                  : "ไม่มีการแจ้งเตือน"}
              </Text>
            </View>
            <Pressable style={styles.closeBtn} hitSlop={8} onPress={handleClose}>
              <Ionicons name="close" size={22} color={colors.primary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {items.length ? (
              items.map((item) => (
                <View
                  key={item.id}
                  style={[styles.item, !item.read && styles.itemUnread]}
                >
                  <View
                    style={[
                      styles.itemIcon,
                      { backgroundColor: iconBgForType(item.type) }
                    ]}
                  >
                    <Ionicons
                      name={iconForType(item.type)}
                      size={20}
                      color={iconColorForType(item.type)}
                    />
                  </View>
                  <View style={styles.itemBody}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemMessage}>{item.message}</Text>
                    <Text style={styles.itemTime}>
                      {formatThaiShortDate(item.createdAt)}
                    </Text>
                  </View>
                  {!item.read ? <View style={styles.unreadDot} /> : null}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="notifications-off-outline"
                  size={40}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyTitle}>ยังไม่มีการแจ้งเตือน</Text>
                <Text style={styles.emptyText}>
                  เมื่อมีผลวิเคราะห์หรือข้อมูลสำคัญ จะแสดงที่นี่
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function useNotificationBadgeCount() {
  const items = useNotificationsSheetStore((s) => s.items);
  return getUnreadNotificationCount(items);
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end"
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(26, 43, 72, 0.42)"
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden"
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center"
  },
  list: {
    flexGrow: 0
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.sm
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  itemUnread: {
    borderColor: colors.brand,
    backgroundColor: colors.infoBg
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  itemBody: {
    flex: 1,
    minWidth: 0
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 4
  },
  itemMessage: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary
  },
  itemTime: {
    marginTop: 6,
    fontSize: 11,
    color: colors.textSecondary
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.notification,
    marginTop: 6
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20
  }
});
