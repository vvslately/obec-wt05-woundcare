import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileScreen } from "../screens/ProfileScreen";
import { AssessmentHistoryScreen } from "../screens/AssessmentHistoryScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { withAnimatedTab } from "./withAnimatedTab";
import type { ProfileStackParamList } from "./profileTypes";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const AnimatedProfileScreen = withAnimatedTab(ProfileScreen);
const AnimatedAssessmentHistoryScreen = withAnimatedTab(AssessmentHistoryScreen);
const AnimatedEditProfileScreen = withAnimatedTab(EditProfileScreen);

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "none"
      }}
    >
      <Stack.Screen name="ProfileMain" component={AnimatedProfileScreen} />
      <Stack.Screen
        name="AssessmentHistory"
        component={AnimatedAssessmentHistoryScreen}
      />
      <Stack.Screen name="EditProfile" component={AnimatedEditProfileScreen} />
    </Stack.Navigator>
  );
}
