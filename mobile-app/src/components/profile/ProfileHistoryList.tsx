import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  formatThaiShortDate,
  getRiskStatusLabel
} from "../../store/assessmentHistoryStore";
import type { ProfileHistoryItem } from "../../utils/profileHistory";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type ProfileHistoryListProps = {
  items: ProfileHistoryItem[];
  loading?: boolean;
  openingCaseId?: number | null;
  deletingCaseId?: number | null;
  onPressItem: (item: ProfileHistoryItem) => void;
  onDeleteItem?: (item: ProfileHistoryItem) => void;
};

export function ProfileHistoryList({
  items,
  loading = false,
  openingCaseId = null,
  deletingCaseId = null,
  onPressItem,
  onDeleteItem
}: ProfileHistoryListProps) {
  if (loading) {
    return <ActivityIndicator color={colors.brand} style={styles.loader} />;
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Ionicons name="document-text-outline" size={28} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>ยังไม่มีประวัติการวิเคราะห์</Text>
        <Text style={styles.emptySubtitle}>
          วิเคราะห์แผลจากแท็บวิเคราะห์ ระบบจะบันทึกผลไว้ที่นี่
        </Text>
      </View>
    );
  }

  return (
    <>
      {items.map((item) => {
        const isBusy = openingCaseId === item.id || deletingCaseId === item.id;

        return (
          <View key={item.id} style={styles.historyCard}>
            <Pressable
              style={styles.historyMain}
              onPress={() => onPressItem(item)}
              disabled={isBusy}
            >
              {item.thumbnailUrl ? (
                <Image source={{ uri: item.thumbnailUrl }} style={styles.historyThumb} />
              ) : (
                <View style={[styles.historyThumb, styles.thumbPlaceholder]}>
                  <Ionicons name="image-outline" size={22} color={colors.textSecondary} />
                </View>
              )}
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle} numberOfLines={1}>
                  {item.woundLocation || item.title || "การประเมินแผล"}
                </Text>
                <Text style={styles.riskText}>ความเสี่ยง {item.riskScore ?? "-"}%</Text>
                <Text style={styles.statusText}>
                  สถานะ:{" "}
                  {item.riskScore != null
                    ? getRiskStatusLabel(item.riskScore)
                    : item.riskTitle || "รอผลวิเคราะห์"}
                </Text>
              </View>
              <View style={styles.dateCol}>
                {openingCaseId === item.id ? (
                  <ActivityIndicator size="small" color={colors.brand} />
                ) : (
                  <>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.dateText}>{formatThaiShortDate(item.createdAt)}</Text>
                  </>
                )}
              </View>
            </Pressable>

            {onDeleteItem ? (
              <Pressable
                style={styles.deleteBtn}
                hitSlop={8}
                onPress={() => onDeleteItem(item)}
                disabled={isBusy}
              >
                {deletingCaseId === item.id ? (
                  <ActivityIndicator size="small" color={colors.notification} />
                ) : (
                  <Ionicons name="trash-outline" size={20} color={colors.notification} />
                )}
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginVertical: spacing.lg
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 6,
    marginBottom: 20
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
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  historyMain: {
    flex: 1,
    flexDirection: "row",
    padding: 12,
    gap: 12
  },
  deleteBtn: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    backgroundColor: colors.background
  },
  historyThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: colors.border
  },
  thumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center"
  },
  historyInfo: {
    flex: 1,
    justifyContent: "center"
  },
  historyTitle: {
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
  }
});
