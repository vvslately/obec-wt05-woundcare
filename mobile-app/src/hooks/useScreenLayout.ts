import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../theme/spacing";

export function useScreenLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const horizontal = Math.max(spacing.screen, insets.left, insets.right);
  const isCompact = width < 360;

  return {
    width,
    horizontal,
    isCompact,
    scrollBottom: spacing.scrollBottom,
    contentPadding: {
      paddingHorizontal: horizontal,
      paddingTop: spacing.md,
      paddingBottom: spacing.scrollBottom
    }
  };
}
