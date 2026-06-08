const LINE_SEED_SANS_TH_CDN =
  "https://cdn.jsdelivr.net/npm/@fontpkg/line-seed-sans-th@1.0.1";

export const lineSeedSansThFonts = {
  thin: `${LINE_SEED_SANS_TH_CDN}/LINESeedSansTH_Th.ttf`,
  regular: `${LINE_SEED_SANS_TH_CDN}/LINESeedSansTH_Rg.ttf`,
  bold: `${LINE_SEED_SANS_TH_CDN}/LINESeedSansTH_Bd.ttf`,
  extraBold: `${LINE_SEED_SANS_TH_CDN}/LINESeedSansTH_XBd.ttf`
} as const;

export const fontFamily = {
  thin: "LineSeedSansTH-Thin",
  regular: "LineSeedSansTH-Regular",
  bold: "LineSeedSansTH-Bold",
  extraBold: "LineSeedSansTH-ExtraBold"
} as const;

export function fontFamilyForWeight(
  weight?: string | number | null
): string {
  const numeric =
    typeof weight === "string" ? Number.parseInt(weight, 10) : weight ?? 400;

  if (Number.isNaN(numeric)) {
    return fontFamily.bold;
  }

  if (numeric >= 700) {
    return fontFamily.extraBold;
  }

  if (numeric <= 300) {
    return fontFamily.thin;
  }

  return fontFamily.bold;
}
