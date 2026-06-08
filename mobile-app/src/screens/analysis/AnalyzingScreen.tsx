import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useScreenLayout } from "../../hooks/useScreenLayout";
import type { AnalysisStackParamList } from "../../navigation/analysisTypes";
import { useAnalysisStore } from "../../store/analysisStore";
import { colors } from "../../theme/colors";
import { radius, spacing } from "../../theme/spacing";

export function AnalyzingScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AnalysisStackParamList>>();
  const { horizontal } = useScreenLayout();
  const submitAnalysis = useAnalysisStore((s) => s.submitAnalysis);
  const photos = useAnalysisStore((s) => s.photos);
  const startedRef = useRef(false);
  const previewUri = photos[0] ?? null;

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    let cancelled = false;

    void (async () => {
      const result = await submitAnalysis();

      if (cancelled) {
        return;
      }

      if (!result.ok) {
        Alert.alert("วิเคราะห์ไม่สำเร็จ", result.message, [
          { text: "ตกลง", onPress: () => navigation.goBack() }
        ]);
        return;
      }

      const finish = () => {
        navigation.replace("AnalysisResult");
      };

      if (result.message) {
        Alert.alert("หมายเหตุ", result.message, [
          { text: "ตกลง", onPress: finish }
        ]);
        return;
      }

      finish();
    })();

    return () => {
      cancelled = true;
    };
  }, [navigation, submitAnalysis]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={[styles.content, { paddingHorizontal: horizontal }]}>
        {previewUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: previewUri }} style={styles.preview} />
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={14} color={colors.card} />
              <Text style={styles.aiBadgeText}>AI 100%</Text>
            </View>
          </View>
        ) : (
          <View style={styles.iconWrap}>
            <Ionicons name="sparkles" size={36} color={colors.brand} />
          </View>
        )}

        <ActivityIndicator size="large" color={colors.brand} style={styles.spinner} />

        <Text style={styles.title}>กำลังวิเคราะห์ด้วย AI</Text>
        <Text style={styles.subtitle}>
          ระบบกำลังประเมินแผลจากรูปภาพและข้อมูลของคุณ{"\n"}
          กรุณารอสักครู่...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: spacing.xl
  },
  previewWrap: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card
  },
  preview: {
    width: "100%",
    height: "100%"
  },
  aiBadge: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.card
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.infoBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg
  },
  spinner: {
    marginBottom: spacing.lg
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.sm
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: "center"
  }
});
