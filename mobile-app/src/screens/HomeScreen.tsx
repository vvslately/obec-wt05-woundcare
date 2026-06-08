import React, { useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { ScreenShell } from "../components/common/ScreenShell";
import { TitleBar } from "../components/TitleBar";
import { AiAnalysisCard } from "../components/home/AiAnalysisCard";
import { GreetingSection } from "../components/home/GreetingSection";
import { QuickAccessGrid } from "../components/home/QuickAccessGrid";
import { LatestAssessmentsSection } from "../components/home/LatestAssessmentsSection";
import { HomeScreenSkeleton } from "../components/skeletons/ScreenSkeletons";
import type { TabParamList } from "../navigation/types";
import { setTabTransition } from "../navigation/tabTransition";
import { useAuthStore } from "../store/authStore";
import { useAssessmentHistoryStore } from "../store/assessmentHistoryStore";
import { spacing } from "../theme/spacing";

export function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const userName = useAuthStore((s) => s.user?.name);
  const isHydrated = useAssessmentHistoryStore((s) => s.isHydrated);
  const hydrate = useAssessmentHistoryStore((s) => s.hydrate);
  const refreshHistory = useAssessmentHistoryStore((s) => s.refresh);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useFocusEffect(
    useCallback(() => {
      if (useAssessmentHistoryStore.getState().isHydrated) {
        void refreshHistory();
        return;
      }
      void hydrate();
    }, [hydrate, refreshHistory])
  );

  if (!isHydrated) {
    return (
      <>
        <StatusBar style="dark" />
        <HomeScreenSkeleton />
      </>
    );
  }

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
