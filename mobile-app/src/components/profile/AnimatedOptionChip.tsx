import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

type AnimatedOptionChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function AnimatedOptionChip({
  label,
  selected,
  onPress
}: AnimatedOptionChipProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: selected ? 1 : 0,
      friction: 8,
      tension: 120,
      useNativeDriver: false
    }).start();
  }, [progress, selected]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 90,
        useNativeDriver: true
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 180,
        useNativeDriver: true
      })
    ]).start();
    onPress();
  };

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.statusCardBg, colors.card]
  });

  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.accent]
  });

  const textColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textSecondary, colors.accent]
  });

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Animated.View
          style={[
            styles.chip,
            {
              backgroundColor,
              borderColor
            }
          ]}
        >
          <Animated.Text
            style={[
              styles.chipText,
              selected && styles.chipTextSelected,
              { color: textColor }
            ]}
          >
            {label}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1
  },
  chipText: {
    fontSize: 13
  },
  chipTextSelected: {
    fontWeight: "600"
  }
});
