import React from "react";
import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { ScreenShell } from "../components/common/ScreenShell";
import { TitleBar } from "../components/TitleBar";
import { AiAnalysisCard } from "../components/home/AiAnalysisCard";
import { GreetingSection } from "../components/home/GreetingSection";
import { QuickAccessGrid } from "../components/home/QuickAccessGrid";
import { LatestAssessmentsSection } from "../components/home/LatestAssessmentsSection";
import type { TabParamList } from "../navigation/types";
import { setTabTransition } from "../navigation/tabTransition";
import { useAuthStore } from "../store/authStore";
import { spacing } from "../theme/spacing";

export function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const userName = useAuthStore((s) => s.user?.name);

  return (
    <>
      <StatusBar style="dark" />
      <ScreenShell
        header={<TitleBar />}
        contentStyle={styles.content}
      >
        <GreetingSection name={userName} />
        <AiAnalysisCard
          onTakePhoto={() => {
            setTabTransition(1);
            navigation.navigate("Analysis", {
              screen: "UploadPhoto",
              params: { openPicker: "camera" }
            });
          }}
          onUploadFromGallery={() => {
            setTabTransition(1);
            navigation.navigate("Analysis", {
              screen: "UploadPhoto",
              params: { openPicker: "gallery" }
            });
          }}
        />
        <QuickAccessGrid />
        <LatestAssessmentsSection />
      </ScreenShell>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingTop: spacing.lg
  }
});
