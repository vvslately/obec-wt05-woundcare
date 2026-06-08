import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { colors } from "../../theme/colors";
import { radius, spacing } from "../../theme/spacing";

type SkeletonProps = {
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBox({ style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.92,
          duration: 760,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 760,
          useNativeDriver: true
        })
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.box, { opacity }, style]} />;
}

export function SkeletonLine({
  width = "100%",
  height = 14,
  style
}: SkeletonProps & { width?: number | `${number}%`; height?: number }) {
  return (
    <SkeletonBox
      style={[
        {
          width,
          height,
          borderRadius: height / 2
        },
        style
      ]}
    />
  );
}

export function SkeletonCircle({
  size,
  style
}: SkeletonProps & { size: number }) {
  return (
    <SkeletonBox
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2
        },
        style
      ]}
    />
  );
}

export function SkeletonBlock({
  height,
  style
}: SkeletonProps & { height: number }) {
  return (
    <SkeletonBox
      style={[
        {
          height,
          borderRadius: radius.lg
        },
        style
      ]}
    />
  );
}

export function SkeletonCard({ children, style }: SkeletonProps & { children?: React.ReactNode }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.border
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm
  }
});
