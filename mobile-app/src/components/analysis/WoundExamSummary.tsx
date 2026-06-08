import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  DURATION_OPTIONS,
  PAIN_OPTIONS,
  type AnalysisForm
} from "../../types/analysis";
import { colors } from "../../theme/colors";
import { radius, spacing } from "../../theme/spacing";

type WoundExamSummaryProps = {
  form: AnalysisForm;
  photos: string[];
  aiSource?: string | null;
  editablePhotos?: boolean;
  onDeletePhoto?: (index: number) => void;
};

function labelForPain(form: AnalysisForm) {
  return PAIN_OPTIONS.find((item) => item.value === form.painLevel)?.label ?? "-";
}

function labelForDuration(form: AnalysisForm) {
  return (
    DURATION_OPTIONS.find((item) => item.value === form.woundDuration)?.label ?? "-"
  );
}

function formatSymptoms(form: AnalysisForm) {
  const items: string[] = [];
  if (form.hasFever) items.push("มีไข้");
  if (form.hasItching) items.push("คัน");
  if (form.hasSwelling) items.push("บวม");
  if (form.hasPus) items.push("มีน้ำเหลือง/หนอง");
  return items.length ? items.join(", ") : "ไม่มี";
}

function formatAiSource(aiSource?: string | null) {
  switch (aiSource) {
    case "openai_vision":
      return "วิเคราะห์จาก AI + รูปแผล";
    case "openai_text":
      return "วิเคราะห์จาก AI (ไม่มีรูป)";
    case "rule_based":
      return "ประเมินจากอาการที่กรอก";
    case "rule_based_fallback":
      return "ประเมินจากอาการ (AI ไม่พร้อม)";
    case "offline_demo":
      return "ข้อมูลตัวอย่าง (ออฟไลน์)";
    default:
      return null;
  }
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) {
    return null;
  }

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function WoundExamSummary({
  form,
  photos,
  aiSource,
  editablePhotos = false,
  onDeletePhoto
}: WoundExamSummaryProps) {
  const sourceLabel = formatAiSource(aiSource);
  const conditionsText =
    form.conditions.length > 0 ? form.conditions.join(", ") : "ไม่ระบุ";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="clipboard-outline" size={18} color={colors.brand} />
        <Text style={styles.title}>ข้อมูลการตรวจสอบบาดแผล</Text>
      </View>

      {photos.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoRow}
        >
          {photos.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.photoWrap}>
              <Image source={{ uri }} style={styles.photo} />
              {editablePhotos && onDeletePhoto ? (
                <Pressable
                  style={styles.photoDelete}
                  hitSlop={6}
                  onPress={() => onDeletePhoto(index)}
                >
                  <Ionicons name="close" size={14} color={colors.card} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.photoPlaceholder}>
          <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.photoPlaceholderText}>ไม่มีรูปแผล</Text>
        </View>
      )}

      {sourceLabel ? (
        <View style={styles.sourceBadge}>
          <Ionicons name="sparkles-outline" size={14} color={colors.brand} />
          <Text style={styles.sourceText}>{sourceLabel}</Text>
        </View>
      ) : null}

      <SummaryRow label="ตำแหน่งแผล" value={form.woundLocation} />
      <SummaryRow label="ระยะเวลาเป็นแผล" value={labelForDuration(form)} />
      <SummaryRow label="ระดับความเจ็บปวด" value={labelForPain(form)} />
      <SummaryRow label="อาการปัจจุบัน" value={formatSymptoms(form)} />
      <SummaryRow label="โรคประจำตัว" value={conditionsText} />
      <SummaryRow label="ยาที่ใช้ / แพ้ยา" value={form.medications || "ไม่มี"} />
      <SummaryRow label="อาการเพิ่มเติม" value={form.additionalNote || "ไม่มี"} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary
  },
  photoRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs
  },
  photoWrap: {
    position: "relative"
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.border
  },
  photoDelete: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.notification,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.card
  },
  photoPlaceholder: {
    height: 88,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: colors.textSecondary
  },
  sourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.infoBg,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  sourceText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.infoText
  },
  row: {
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  rowLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    lineHeight: 20
  }
});
