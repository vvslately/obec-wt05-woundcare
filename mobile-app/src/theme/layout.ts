export const TAB_BAR = {
  contentHeight: 56,
  minBottomInset: 12
} as const;

export function getTabBarTotalHeight(bottomInset: number) {
  return TAB_BAR.contentHeight + Math.max(bottomInset, TAB_BAR.minBottomInset);
}
