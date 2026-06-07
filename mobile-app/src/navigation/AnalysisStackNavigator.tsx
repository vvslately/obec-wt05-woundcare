import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AnalysisScreen } from "../screens/AnalysisScreen";
import { AdditionalInfoScreen } from "../screens/analysis/AdditionalInfoScreen";
import { AnalysisResultScreen } from "../screens/analysis/AnalysisResultScreen";
import type { AnalysisStackParamList } from "./analysisTypes";

const Stack = createNativeStackNavigator<AnalysisStackParamList>();

export function AnalysisStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationTypeForReplace: "push",
        gestureEnabled: true,
        gestureDirection: "horizontal",
        fullScreenGestureEnabled: true
      }}
    >
      <Stack.Screen name="UploadPhoto" component={AnalysisScreen} />
      <Stack.Screen name="AdditionalInfo" component={AdditionalInfoScreen} />
      <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} />
    </Stack.Navigator>
  );
}
