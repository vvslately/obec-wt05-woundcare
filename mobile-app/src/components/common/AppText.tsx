import React from "react";
import { StyleSheet, Text as RNText, type TextProps } from "react-native";
import { fontFamilyForWeight } from "../../theme/fonts";

export function AppText({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style);

  return (
    <RNText
      {...props}
      style={[style, { fontFamily: fontFamilyForWeight(flat?.fontWeight) }]}
    />
  );
}
