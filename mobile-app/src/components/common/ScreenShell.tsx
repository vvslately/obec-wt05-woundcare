import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { useScreenLayout } from "../../hooks/useScreenLayout";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type ScreenShellProps = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  withTabBarInset?: boolean;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, "contentContainerStyle" | "children">;
};

export function ScreenShell({
  header,
  footer,
  scroll = true,
  withTabBarInset = true,
  children,
  contentStyle,
  scrollProps
}: ScreenShellProps) {
  const { horizontal, scrollBottom } = useScreenLayout({ withTabBar: withTabBarInset });

  return (
    <View style={styles.root}>
      {header}
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: horizontal,
              paddingTop: spacing.md,
              paddingBottom: footer ? spacing.md : scrollBottom
            },
            contentStyle
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.body,
            { paddingHorizontal: horizontal },
            contentStyle
          ]}
        >
          {children}
        </View>
      )}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    flex: 1
  },
  content: {
    flexGrow: 1
  },
  body: {
    flex: 1
  }
});
