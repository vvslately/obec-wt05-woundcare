import React from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type CameraCardProps = {
  name: string;
  preview: ImageSourcePropType;
  online?: boolean;
};

type ActionItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const ACTIONS: ActionItem[] = [
  { icon: "videocam-outline", label: "ถ่ายทอดสด" },
  { icon: "time-outline", label: "ประวัติ" },
  { icon: "settings-outline", label: "การตั้งค่า" }
];

export function CameraCard({ name, preview, online = true }: CameraCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        {online && (
          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>ออนไลน์</Text>
          </View>
        )}
      </View>

      <Pressable style={styles.previewWrap}>
        <Image source={preview} style={styles.preview} resizeMode="cover" />
        <View style={styles.playOverlay}>
          <View style={styles.playBtn}>
            <Ionicons name="play" size={22} color={colors.card} style={styles.playIcon} />
          </View>
        </View>
      </Pressable>

      <View style={styles.actions}>
        {ACTIONS.map((action, index) => (
          <React.Fragment key={action.label}>
            {index > 0 && <View style={styles.divider} />}
            <Pressable style={styles.actionBtn}>
              <Ionicons name={action.icon} size={20} color={colors.primary} />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.success
  },
  previewWrap: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14
  },
  preview: {
    width: "100%",
    height: 180,
    backgroundColor: "#D1D9E6"
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(26, 43, 72, 0.15)"
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(26, 43, 72, 0.55)",
    alignItems: "center",
    justifyContent: "center"
  },
  playIcon: {
    marginLeft: 3
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    gap: 4
  },
  actionLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "500"
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border
  }
});
