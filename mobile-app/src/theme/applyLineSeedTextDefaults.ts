import type { ReactNode } from "react";
import { StyleSheet, Text, TextInput, type TextProps } from "react-native";
import { fontFamily, fontFamilyForWeight } from "./fonts";

type PatchedTextComponent = {
  render?: (props: TextProps, ref: unknown) => ReactNode;
  defaultProps?: Partial<TextProps>;
  __lineSeedPatched?: boolean;
};

function patchTextComponent(
  Component: typeof Text | typeof TextInput,
  fallbackFamily: string
) {
  const target = Component as unknown as PatchedTextComponent;

  if (target.__lineSeedPatched || !target.render) {
    return;
  }

  const originalRender = target.render.bind(Component);

  target.render = function patchedRender(props: TextProps, ref: unknown) {
    const flat = StyleSheet.flatten(props?.style);
    const family = fontFamilyForWeight(flat?.fontWeight ?? "400") || fallbackFamily;

    return originalRender(
      {
        ...props,
        style: [props?.style, { fontFamily: family }]
      },
      ref
    );
  };

  target.__lineSeedPatched = true;
}

export function applyLineSeedTextDefaults() {
  const textDefaults = Text.defaultProps ?? {};
  const inputDefaults = TextInput.defaultProps ?? {};

  Text.defaultProps = {
    ...textDefaults,
    style: [{ fontFamily: fontFamily.bold, fontWeight: "400" }, textDefaults.style]
  };

  TextInput.defaultProps = {
    ...inputDefaults,
    style: [{ fontFamily: fontFamily.bold, fontWeight: "400" }, inputDefaults.style]
  };

  patchTextComponent(Text, fontFamily.bold);
  patchTextComponent(TextInput, fontFamily.bold);
}
