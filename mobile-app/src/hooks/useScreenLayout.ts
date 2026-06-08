import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTabBarTotalHeight } from "../theme/layout";
import { spacing } from "../theme/spacing";

type ScreenLayoutOptions = {
  /** Reserve space above the bottom tab bar */
  withTabBar?: boolean;
};

export function useScreenLayout(options: ScreenLayoutOptions = {}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const withTabBar = options.withTabBar ?? false;

  const horizontal = Math.max(spacing.screen, insets.left, insets.right);
  const isCompact = width < 360;
  const scrollBottom = withTabBar
    ? getTabBarTotalHeight(insets.bottom) + spacing.md
    : spacing.lg + Math.max(insets.bottom, spacing.sm);

  return {
    width,
    horizontal,
    isCompact,
    scrollBottom,
    contentPadding: {
      paddingHorizontal: horizontal,
      paddingTop: spacing.md,
      paddingBottom: scrollBottom
    }
  };
}
