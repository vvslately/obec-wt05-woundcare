let lastTabIndex = 0;
let transitionDirection = 1;

export function setTabTransition(nextIndex: number) {
  transitionDirection = nextIndex >= lastTabIndex ? 1 : -1;
  lastTabIndex = nextIndex;
}

export function getTabTransitionDirection() {
  return transitionDirection;
}
