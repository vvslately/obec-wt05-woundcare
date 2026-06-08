import React from "react";
import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AnalysisScreen } from "../screens/AnalysisScreen";
import { AdditionalInfoScreen } from "../screens/analysis/AdditionalInfoScreen";
import { AnalyzingScreen } from "../screens/analysis/AnalyzingScreen";
import { AnalysisResultScreen } from "../screens/analysis/AnalysisResultScreen";
import { withAnimatedTab } from "./withAnimatedTab";
import type { AnalysisStackParamList } from "./analysisTypes";

const Stack = createNativeStackNavigator<AnalysisStackParamList>();

const AnimatedUploadPhoto = withAnimatedTab(AnalysisScreen);
const AnimatedAdditionalInfo = withAnimatedTab(AdditionalInfoScreen);
const AnimatedAnalysisResult = withAnimatedTab(AnalysisResultScreen);

const stackScreenOptions = {
  headerShown: false,
  animation: "none" as const,
  gestureEnabled: true,
  fullScreenGestureEnabled: false,
  ...(Platform.OS === "ios"
    ? {
        gestureResponseDistance: 18
      }
    : {})
};

export function AnalysisStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="UploadPhoto" component={AnimatedUploadPhoto} />
      <Stack.Screen name="AdditionalInfo" component={AnimatedAdditionalInfo} />
      <Stack.Screen
        name="Analyzing"
        component={AnalyzingScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="AnalysisResult" component={AnimatedAnalysisResult} />
    </Stack.Navigator>
  );
}
