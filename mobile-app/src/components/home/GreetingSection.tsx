import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

type GreetingSectionProps = {
  name?: string | null;
};

function displayName(name?: string | null) {
  const trimmed = name?.trim();
  return trimmed || "ผู้ใช้";
}

export function GreetingSection({ name }: GreetingSectionProps) {
  const fullName = displayName(name);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>สวัสดี คุณ{fullName} 👋</Text>
      <Text style={styles.subtitle}>เราอยู่ที่นี่เพื่อดูแลคุณ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0
  },
  greeting: {
    fontSize: 23,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary
  }
});
