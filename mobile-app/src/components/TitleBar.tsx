import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScreenLayout } from "../hooks/useScreenLayout";
import { useNotificationsSheetStore } from "../store/notificationsSheetStore";
import { useNotificationBadgeCount } from "./notifications/NotificationSheet";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type TitleBarProps = {
  onNotificationPress?: () => void;
};

export function TitleBar({ onNotificationPress }: TitleBarProps) {
  const { horizontal } = useScreenLayout();
  const openNotifications = useNotificationsSheetStore((s) => s.open);
  const notificationCount = useNotificationBadgeCount();
  const handleNotificationPress = onNotificationPress ?? openNotifications;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={[styles.bar, { paddingHorizontal: horizontal }]}>
        <View style={styles.brand}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title} numberOfLines={1}>
            <Text style={styles.titleBrand}>WoundCare</Text>
            <Text style={styles.titleAi}> AI</Text>
          </Text>
        </View>

        <Pressable
          style={styles.notifBtn}
          hitSlop={8}
          onPress={handleNotificationPress}
        >
          <Ionicons
            name="notifications-outline"
            size={26}
            color={colors.primary}
          />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? "9+" : String(notificationCount)}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.card
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  brand: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0
  },
  logo: {
    width: 36,
    height: 36
  },
  title: {
    flexShrink: 1,
    fontSize: 21,
    fontWeight: "800"
  },
  titleBrand: {
    color: colors.brand
  },
  titleAi: {
    color: colors.primary
  },
  notifBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.notification,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.card
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.card
  }
});
