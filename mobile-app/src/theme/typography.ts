import type { TextStyle } from "react-native";
import { fontFamily, fontFamilyForWeight } from "./fonts";

type WeightStyle = Pick<TextStyle, "fontWeight">;

function weighted(weight: TextStyle["fontWeight"]): TextStyle {
  return {
    fontWeight: weight,
    fontFamily: fontFamilyForWeight(weight)
  };
}

export const typography = {
  fontFamily,
  regular: { fontFamily: fontFamily.regular, fontWeight: "400" as const },
  bold: { fontFamily: fontFamily.bold, fontWeight: "700" as const },
  extraBold: { fontFamily: fontFamily.extraBold, fontWeight: "800" as const },
  weight: weighted
};
