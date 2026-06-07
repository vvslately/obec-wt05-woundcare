import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

type QuickItem = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
};

const ITEMS: QuickItem[] = [
  {
    icon: "time-outline",
    iconColor: colors.brand,
    iconBg: "#E8F0F8",
    title: "ประเมินล่าสุด",
    subtitle: "ดูผลย้อนหลัง"
  },
  {
    icon: "heart-outline",
    iconColor: colors.success,
    iconBg: "#E8F5EA",
    title: "โรคประจำตัว",
    subtitle: "จัดการข้อมูล"
  },
  {
    icon: "location-outline",
    iconColor: colors.brand,
    iconBg: "#E8F0F8",
    title: "โรงพยาบาล",
    subtitle: "ใกล้ฉัน"
  }
];

export function QuickAccessGrid() {
  return (
    <View style={styles.grid}>
      {ITEMS.map((item) => (
        <Pressable key={item.title} style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
            <Ionicons name={item.icon} size={22} color={item.iconColor} />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 10
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center"
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand,
    textAlign: "center",
    marginBottom: 2
  },
  subtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: "center"
  }
});
