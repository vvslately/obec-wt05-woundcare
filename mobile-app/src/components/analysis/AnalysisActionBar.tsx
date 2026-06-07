import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useScreenLayout } from "../../hooks/useScreenLayout";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type AnalysisActionBarProps = {
  disabled?: boolean;
  confirmDisabled?: boolean;
  onRetake?: () => void;
  onCrop?: () => void;
  onConfirm?: () => void;
};

export function AnalysisActionBar({
  disabled = false,
  confirmDisabled = false,
  onRetake,
  onCrop,
  onConfirm
}: AnalysisActionBarProps) {
  const { horizontal, isCompact } = useScreenLayout();

  return (
    <View style={[styles.bar, { paddingHorizontal: horizontal }]}>
      <Pressable
        style={[styles.secondaryBtn, disabled && styles.btnDisabled]}
        onPress={onRetake}
        disabled={disabled}
      >
        <Ionicons name="refresh" size={22} color={colors.primary} />
        {!isCompact && <Text style={styles.secondaryText}>ถ่ายใหม่</Text>}
      </Pressable>

      <Pressable
        style={[
          styles.secondaryBtn,
          (disabled || confirmDisabled) && styles.btnDisabled
        ]}
        onPress={onCrop}
        disabled={disabled || confirmDisabled}
      >
        <Ionicons name="crop-outline" size={22} color={colors.primary} />
        {!isCompact && <Text style={styles.secondaryText}>ครอบรูป</Text>}
      </Pressable>

      <Pressable
        style={[
          styles.primaryBtn,
          (disabled || confirmDisabled) && styles.primaryBtnDisabled
        ]}
        onPress={onConfirm}
        disabled={disabled || confirmDisabled}
      >
        <Ionicons name="checkmark" size={22} color={colors.card} />
        <Text style={styles.primaryText}>ใช้ภาพนี้</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm
  },
  secondaryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    minHeight: 52
  },
  secondaryText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary
  },
  primaryBtn: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 14,
    minHeight: 52
  },
  primaryBtnDisabled: {
    opacity: 0.45
  },
  btnDisabled: {
    opacity: 0.45
  },
  primaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.card
  }
});
