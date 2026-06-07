import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { useScreenLayout } from "../../hooks/useScreenLayout";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type ScreenFooterProps = ViewProps & {
  children: React.ReactNode;
};

export function ScreenFooter({ children, style, ...rest }: ScreenFooterProps) {
  const { horizontal } = useScreenLayout();

  return (
    <View
      style={[styles.footer, { paddingHorizontal: horizontal }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border
  }
});
