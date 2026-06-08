import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  buildAiMetaSummary,
  formatAiModelLabel,
  isOpenAiSource
} from "../../utils/aiMeta";
import { colors } from "../../theme/colors";
import { radius, spacing } from "../../theme/spacing";

type AiMetaBadgeProps = {
  aiSource: string | null | undefined;
  aiModel: string | null | undefined;
  aiNote?: string | null;
};

export function AiMetaBadge({ aiSource, aiModel, aiNote }: AiMetaBadgeProps) {
  if (!isOpenAiSource(aiSource)) {
    return null;
  }

  const summary = buildAiMetaSummary(aiSource, aiModel, aiNote);
  const modelLabel = formatAiModelLabel(aiModel);

  return (
    <Pressable
      style={styles.badge}
      hitSlop={8}
      onPress={() => {
        if (!summary) return;
        Alert.alert("ข้อมูลจาก ChatGPT", summary);
      }}
    >
      <Ionicons name="sparkles" size={12} color={colors.brand} />
      <View style={styles.textWrap}>
        <Text style={styles.label} numberOfLines={1}>
          ChatGPT
        </Text>
        <Text style={styles.model} numberOfLines={1}>
          {modelLabel}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: 96,
    backgroundColor: colors.infoBg,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  textWrap: {
    flexShrink: 1,
    minWidth: 0
  },
  label: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.brand,
    lineHeight: 12
  },
  model: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.infoText,
    lineHeight: 12
  }
});
