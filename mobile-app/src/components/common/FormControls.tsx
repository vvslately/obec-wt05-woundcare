import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentControl<T extends string>({
  options,
  value,
  onChange
}: SegmentControlProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.item, active && styles.itemActive]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type YesNoRowProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function YesNoRow({ label, value, onChange }: YesNoRowProps) {
  return (
    <View style={styles.yesNoRow}>
      <Text style={styles.yesNoLabel}>{label}</Text>
      <View style={styles.yesNoButtons}>
        <Pressable
          style={[styles.yesNoBtn, !value && styles.yesNoBtnActive]}
          onPress={() => onChange(false)}
        >
          <Text style={[styles.yesNoText, !value && styles.yesNoTextActive]}>
            ไม่มี
          </Text>
        </Pressable>
        <Pressable
          style={[styles.yesNoBtn, value && styles.yesNoBtnActive]}
          onPress={() => onChange(true)}
        >
          <Text style={[styles.yesNoText, value && styles.yesNoTextActive]}>
            มี
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

type ChipSelectProps = {
  options: string[];
  values: string[];
  onToggle: (item: string) => void;
};

export function ChipSelect({ options, values, onToggle }: ChipSelectProps) {
  return (
    <View style={styles.chips}>
      {options.map((item) => {
        const selected = values.includes(item);
        return (
          <Pressable
            key={item}
            style={[styles.chip, selected && styles.chipActive]}
            onPress={() => onToggle(item)}
          >
            <Text style={[styles.chipText, selected && styles.chipTextActive]}>
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  item: {
    flexGrow: 1,
    flexBasis: "22%",
    minWidth: 72,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card
  },
  itemActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand
  },
  text: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600"
  },
  textActive: {
    color: colors.card
  },
  yesNoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  yesNoLabel: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    flex: 1
  },
  yesNoButtons: {
    flexDirection: "row",
    gap: 8
  },
  yesNoBtn: {
    minWidth: 56,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center"
  },
  yesNoBtnActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand
  },
  yesNoText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600"
  },
  yesNoTextActive: {
    color: colors.card
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.statusCardBg
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary
  },
  chipTextActive: {
    color: colors.accent,
    fontWeight: "600"
  }
});
