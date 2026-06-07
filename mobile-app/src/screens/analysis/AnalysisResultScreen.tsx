import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { ScreenHeader } from "../../components/common/ScreenHeader";
import { ScreenShell } from "../../components/common/ScreenShell";
import { useScreenLayout } from "../../hooks/useScreenLayout";
import type { AnalysisStackParamList } from "../../navigation/analysisTypes";
import { setTabTransition } from "../../navigation/tabTransition";
import { useAnalysisStore } from "../../store/analysisStore";
import { colors } from "../../theme/colors";
import { radius, spacing } from "../../theme/spacing";
import { DEMO_ANALYSIS } from "../../types/analysis";

function RiskRing({ score, size }: { score: number; size: number }) {
  const inner = Math.round(size * 0.78);

  return (
    <View
      style={[
        styles.ringOuter,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: Math.max(8, size * 0.07)
        }
      ]}
    >
      <View
        style={{
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text style={[styles.ringValue, { fontSize: size * 0.22 }]}>{score}%</Text>
      </View>
    </View>
  );
}

function ProbabilityBar({
  label,
  value
}: {
  label: string;
  value: number;
}) {
  const color =
    value >= 70
      ? colors.notification
      : value >= 30
        ? colors.amber
        : colors.amberLight;

  return (
    <View style={styles.probItem}>
      <Text style={styles.probLabel} numberOfLines={2}>
        {label}
      </Text>
      <View style={styles.probTrack}>
        <View
          style={[styles.probFill, { width: `${value}%`, backgroundColor: color }]}
        />
      </View>
      <Text style={styles.probValue}>{value}%</Text>
    </View>
  );
}

export function AnalysisResultScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AnalysisStackParamList>>();
  const { width, horizontal } = useScreenLayout();
  const result = useAnalysisStore((s) => s.result) || DEMO_ANALYSIS;
  const aiNote = useAnalysisStore((s) => s.aiNote);
  const ringSize = Math.min(160, Math.max(120, width - horizontal * 2 - spacing.xl));
  const findingWidth = (width - horizontal * 2 - spacing.sm) / 2 - spacing.xs;

  return (
    <>
      <StatusBar style="dark" />
      <ScreenShell
        header={
          <ScreenHeader
            title="ผลวิเคราะห์เบื้องต้น"
            onBack={() => navigation.goBack()}
            onInfoPress={() => {}}
          />
        }
      >
        {aiNote ? (
          <View style={styles.fallbackBanner}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.disclaimerText}
            />
            <Text style={styles.fallbackText}>{aiNote}</Text>
          </View>
        ) : null}

        <View style={styles.alertBox}>
          <Ionicons name="warning" size={20} color={colors.notification} />
          <Text style={styles.alertText}>{result.riskTitle}</Text>
        </View>

        <View style={styles.center}>
          <RiskRing score={result.riskScore} size={ringSize} />
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>{result.disclaimer}</Text>
        </View>

        <Text style={styles.sectionTitle}>ความเป็นไปได้ของสภาวะ</Text>
        {result.conditions.map((item) => (
          <ProbabilityBar
            key={item.nameTh}
            label={item.nameTh}
            value={item.probability}
          />
        ))}

        <Text style={styles.sectionTitle}>สิ่งที่ AI พบ</Text>
        <View style={styles.findingsGrid}>
          {result.findings.map((item) => (
            <View
              key={item.label}
              style={[styles.findingCard, { width: findingWidth }]}
            >
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={22}
                color={colors.brand}
              />
              <Text style={styles.findingText} numberOfLines={2}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{result.warningNote}</Text>
        </View>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => {
            setTabTransition(2);
            navigation.getParent()?.navigate("Advice");
          }}
        >
          <Text style={styles.primaryBtnText}>ดูการปฐมพยาบาลเบื้องต้น</Text>
        </Pressable>
      </ScreenShell>
    </>
  );
}

const styles = StyleSheet.create({
  fallbackBanner: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
    backgroundColor: colors.disclaimerBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  fallbackText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.disclaimerText
  },
  alertBox: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.warningBorder,
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    padding: spacing.md
  },
  alertText: {
    flex: 1,
    color: colors.notification,
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 20
  },
  center: { alignItems: "center", marginVertical: spacing.lg },
  ringOuter: {
    borderColor: colors.warningBorder,
    alignItems: "center",
    justifyContent: "center"
  },
  ringValue: {
    fontWeight: "800",
    color: colors.notification
  },
  disclaimerBox: {
    backgroundColor: colors.disclaimerBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.disclaimerText
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
    marginTop: spacing.sm
  },
  probItem: { marginBottom: spacing.md },
  probLabel: { fontSize: 13, color: colors.primary, marginBottom: 6 },
  probTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden"
  },
  probFill: { height: "100%", borderRadius: 4 },
  probValue: {
    alignSelf: "flex-end",
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: colors.notification
  },
  findingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  findingCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 96
  },
  findingText: {
    fontSize: 12,
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600"
  },
  noteBox: {
    backgroundColor: colors.cautionBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg
  },
  noteText: { fontSize: 13, color: colors.cautionText, lineHeight: 20 },
  primaryBtn: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 52
  },
  primaryBtnText: { color: colors.card, fontWeight: "700", fontSize: 15 }
});
