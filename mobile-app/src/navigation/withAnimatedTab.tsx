import type { ComponentType } from "react";
import { AnimatedTabScreen } from "./AnimatedTabScreen";

export function withAnimatedTab<P extends object>(
  Screen: ComponentType<P>
): ComponentType<P> {
  function WrappedScreen(props: P) {
    return (
      <AnimatedTabScreen>
        <Screen {...props} />
      </AnimatedTabScreen>
    );
  }

  WrappedScreen.displayName = `AnimatedTab(${Screen.displayName || Screen.name || "Screen"})`;

  return WrappedScreen;
}
