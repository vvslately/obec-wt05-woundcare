import React, { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { ScreenShell } from "../components/common/ScreenShell";
import { setTabTransition } from "../navigation/tabTransition";
import type { TabParamList } from "../navigation/types";
import { useAnalysisStore } from "../store/analysisStore";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { DEMO_ANALYSIS } from "../types/analysis";

const STEP_ICONS = [
  "hand-left-outline",
  "water-outline",
  "bandage-outline",
  "close-circle-outline",
  "eye-outline"
] as const;

export function AdviceScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const result = useAnalysisStore((s) => s.result) || DEMO_ANALYSIS;

  useEffect(() => {
    if (!useAnalysisStore.getState().result) {
      useAnalysisStore.setState({ result: DEMO_ANALYSIS });
    }
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <ScreenShell header={<ScreenHeader title="การปฐมพยาบาลเบื้องต้น" />}>
        {result.firstAid.map((step, index) => (
          <View key={step.step} style={styles.stepCard}>
            <View style={styles.stepIcon}>
              <Ionicons
                name={STEP_ICONS[index] || "medkit-outline"}
                size={20}
                color={colors.brand}
              />
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>
                {step.step}. {step.title}
              </Text>
              <Text style={styles.stepDesc}>{step.description}</Text>
            </View>
          </View>
        ))}

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>ควรพบแพทย์ทันที หากมี</Text>
          {result.emergencyWarnings.map((item) => (
            <Text key={item} style={styles.warningItem}>
              • {item}
            </Text>
          ))}
        </View>

        <Pressable
          style={styles.outlineBtn}
          onPress={() =>
            navigation.navigate("Analysis", { screen: "AnalysisResult" })
          }
        >
          <Text style={styles.outlineBtnText}>ดูผลวิเคราะห์อีกครั้ง</Text>
        </Pressable>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => {
            setTabTransition(3);
            navigation.navigate("Hospital");
          }}
        >
          <Ionicons name="location-outline" size={18} color={colors.card} />
          <Text style={styles.primaryBtnText}>ไปโรงพยาบาลใกล้ฉัน</Text>
        </Pressable>
      </ScreenShell>
    </>
  );
}

const styles = StyleSheet.create({
  stepCard: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.statusCardBg,
    alignItems: "center",
    justifyContent: "center"
  },
  stepBody: { flex: 1, minWidth: 0 },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.xs
  },
  stepDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  warningBox: {
    borderWidth: 1,
    borderColor: colors.warningBorder,
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.md
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.notification,
    marginBottom: spacing.sm
  },
  warningItem: {
    fontSize: 13,
    color: colors.warningText,
    lineHeight: 22
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.sm
  },
  outlineBtnText: { color: colors.brand, fontWeight: "700" },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm
  },
  primaryBtnText: { color: colors.card, fontWeight: "700", fontSize: 15 }
});
