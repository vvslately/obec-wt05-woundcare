import React, { useCallback } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  formatThaiShortDate,
  getRiskStatusLabel,
  useAssessmentHistoryStore
} from "../../store/assessmentHistoryStore";
import { useAnalysisStore } from "../../store/analysisStore";
import type { TabParamList } from "../../navigation/types";
import { setTabTransition } from "../../navigation/tabTransition";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export function LatestAssessmentsSection() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const items = useAssessmentHistoryStore((s) => s.items);
  const hydrate = useAssessmentHistoryStore((s) => s.hydrate);
  const latest = items[0] ?? null;

  useFocusEffect(
    useCallback(() => {
      void hydrate();
    }, [hydrate])
  );

  const openRecord = (id: number) => {
    const record = items.find((item) => item.id === id);
    if (!record) return;

    useAnalysisStore.setState({
      photos: record.photos,
      selectedPhotoIndex: 0,
      form: record.form,
      caseId: record.id,
      result: record.result,
      aiSource: record.aiSource,
      aiNote: null
    });

    setTabTransition(1);
    navigation.navigate("Analysis", { screen: "AnalysisResult" });
  };

  const openProfile = () => {
    setTabTransition(4);
    navigation.navigate("Profile");
  };

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>ประเมินล่าสุด</Text>
        <Pressable style={styles.viewAllBtn} onPress={openProfile} hitSlop={8}>
          <Text style={styles.viewAllText}>ดูทั้งหมด</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.link} />
        </Pressable>
      </View>

      {latest ? (
        <Pressable style={styles.card} onPress={() => openRecord(latest.id)}>
          {latest.photoUri ? (
            <Image source={{ uri: latest.photoUri }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
            </View>
          )}

          <View style={styles.info}>
            <Text style={styles.location} numberOfLines={1}>
              {latest.woundLocation || "ไม่ระบุตำแหน่งแผล"}
            </Text>
            <Text style={styles.riskText}>ความเสี่ยง {latest.riskScore}%</Text>
            <Text style={styles.statusText}>
              สถานะ: {getRiskStatusLabel(latest.riskScore)}
            </Text>
          </View>

          <View style={styles.dateCol}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.dateText}>{formatThaiShortDate(latest.createdAt)}</Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={28} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>ยังไม่มีประวัติการประเมิน</Text>
          <Text style={styles.emptySubtitle}>
            ถ่ายรูปแผลและวิเคราะห์เพื่อดูผลล่าสุดที่นี่
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.link
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    alignItems: "center"
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: colors.border
  },
  thumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center"
  },
  info: {
    flex: 1,
    justifyContent: "center"
  },
  location: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4
  },
  riskText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.notification,
    marginBottom: 2
  },
  statusText: {
    fontSize: 12,
    color: colors.notification
  },
  dateCol: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 72
  },
  dateText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center"
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 6
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center"
  }
});
