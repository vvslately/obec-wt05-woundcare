import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnalysisStackNavigator } from "./AnalysisStackNavigator";
import { AnimatedTabBar } from "./AnimatedTabBar";
import { withAnimatedTab } from "./withAnimatedTab";
import { HomeScreen } from "../screens/HomeScreen";
import { AdviceScreen } from "../screens/AdviceScreen";
import { HospitalScreen } from "../screens/HospitalScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { colors } from "../theme/colors";
import { getTabBarTotalHeight } from "../theme/layout";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

const AnimatedHomeScreen = withAnimatedTab(HomeScreen);
const AnimatedAnalysisStack = withAnimatedTab(AnalysisStackNavigator);
const AnimatedAdviceScreen = withAnimatedTab(AdviceScreen);
const AnimatedHospitalScreen = withAnimatedTab(HospitalScreen);
const AnimatedProfileScreen = withAnimatedTab(ProfileScreen);

export function TabRoutes() {
  const insets = useSafeAreaInsets();
  const bottomOffset = getTabBarTotalHeight(insets.bottom);

  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "none",
        sceneStyle: [styles.scene, { paddingBottom: bottomOffset }]
      }}
    >
      <Tab.Screen name="Home" component={AnimatedHomeScreen} />
      <Tab.Screen name="Analysis" component={AnimatedAnalysisStack} />
      <Tab.Screen name="Advice" component={AnimatedAdviceScreen} />
      <Tab.Screen name="Hospital" component={AnimatedHospitalScreen} />
      <Tab.Screen name="Profile" component={AnimatedProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: colors.background
  }
});
