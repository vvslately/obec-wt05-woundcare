import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AnalysisStackNavigator } from "./AnalysisStackNavigator";
import { AnimatedTabBar } from "./AnimatedTabBar";
import { withAnimatedTab } from "./withAnimatedTab";
import { NotificationSheet } from "../components/notifications/NotificationSheet";
import { HomeScreen } from "../screens/HomeScreen";
import { HospitalScreen } from "../screens/HospitalScreen";
import { ProfileStackNavigator } from "./ProfileStackNavigator";
import { useNotificationsSheetStore } from "../store/notificationsSheetStore";
import { colors } from "../theme/colors";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

const AnimatedHomeScreen = withAnimatedTab(HomeScreen);
const AnimatedAnalysisStack = withAnimatedTab(AnalysisStackNavigator);
const AnimatedHospitalScreen = withAnimatedTab(HospitalScreen);
const AnimatedProfileStack = withAnimatedTab(ProfileStackNavigator);

export function TabRoutes() {
  const sheetVisible = useNotificationsSheetStore((s) => s.visible);
  const closeSheet = useNotificationsSheetStore((s) => s.close);

  return (
    <>
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "none",
        sceneStyle: styles.scene
      }}
    >
      <Tab.Screen name="Home" component={AnimatedHomeScreen} />
      <Tab.Screen name="Analysis" component={AnimatedAnalysisStack} />
      <Tab.Screen name="Hospital" component={AnimatedHospitalScreen} />
      <Tab.Screen name="Profile" component={AnimatedProfileStack} />
    </Tab.Navigator>
    <NotificationSheet visible={sheetVisible} onClose={closeSheet} />
    </>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: colors.background
  }
});
