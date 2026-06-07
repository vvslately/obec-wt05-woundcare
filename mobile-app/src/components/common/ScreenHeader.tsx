import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScreenLayout } from "../../hooks/useScreenLayout";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  onInfoPress?: () => void;
};

export function ScreenHeader({ title, onBack, onInfoPress }: ScreenHeaderProps) {
  const { horizontal } = useScreenLayout();

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={[styles.bar, { paddingHorizontal: horizontal }]}>
        {onBack ? (
          <Pressable style={styles.sideBtn} hitSlop={8} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.sideSpacer} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Pressable
          style={styles.sideBtn}
          hitSlop={8}
          onPress={onInfoPress}
          disabled={!onInfoPress}
        >
          {onInfoPress ? (
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={colors.primary}
            />
          ) : (
            <View style={styles.sideSpacer} />
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
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  sideBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  sideSpacer: {
    width: 36,
    height: 36
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary,
    marginHorizontal: spacing.sm
  }
});
