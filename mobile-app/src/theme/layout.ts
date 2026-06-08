export const TAB_BAR = {
  contentHeight: 62,
  minBottomInset: 12,
  bottomOffset: 4
} as const;

export function getTabBarTotalHeight(bottomInset: number) {
  return (
    TAB_BAR.contentHeight +
    Math.max(bottomInset, TAB_BAR.minBottomInset) +
    TAB_BAR.bottomOffset
  );
}
