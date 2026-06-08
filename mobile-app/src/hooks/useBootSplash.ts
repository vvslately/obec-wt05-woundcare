import { useEffect, useState } from "react";
import { useAppFonts } from "./useAppFonts";

const BOOT_SPLASH_MS = 3000;

export function useBootSplash() {
  const { fontsReady } = useAppFonts();
  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), BOOT_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  return {
    bootReady: fontsReady && minDelayDone
  };
}
