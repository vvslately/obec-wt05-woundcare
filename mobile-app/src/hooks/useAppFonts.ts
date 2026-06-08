import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { applyLineSeedTextDefaults } from "../theme/applyLineSeedTextDefaults";
import { fontFamily, lineSeedSansThFonts } from "../theme/fonts";

SplashScreen.preventAutoHideAsync().catch(() => {});

export function useAppFonts() {
  const [defaultsApplied, setDefaultsApplied] = useState(false);

  const [loaded, error] = useFonts({
    [fontFamily.thin]: lineSeedSansThFonts.thin,
    [fontFamily.regular]: lineSeedSansThFonts.regular,
    [fontFamily.bold]: lineSeedSansThFonts.bold,
    [fontFamily.extraBold]: lineSeedSansThFonts.extraBold
  });

  useEffect(() => {
    if (!loaded && !error) {
      return;
    }

    if (loaded) {
      applyLineSeedTextDefaults();
    }

    setDefaultsApplied(true);
  }, [error, loaded]);

  return {
    fontsReady: (loaded || Boolean(error)) && defaultsApplied,
    fontsError: error
  };
}
