import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export function SecurityStatusCard() {
  return (
    <Pressable style={styles.card}>
      <View style={styles.shield}>
        <Ionicons name="shield-checkmark" size={22} color={colors.card} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>ระบบปลอดภัย</Text>
        <Text style={styles.subtitle}>ทุกอย่างทำงานปกติ</Text>
      </View>
      <View style={styles.chevronBtn}>
        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.statusCardBg,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24
  },
  shield: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  textBlock: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 2
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary
  },
  chevronBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center"
  }
});
