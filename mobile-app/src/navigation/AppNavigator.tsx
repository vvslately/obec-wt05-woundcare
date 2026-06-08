import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AuthScreen } from "../screens/AuthScreen";
import { AuthScreenSkeleton } from "../components/skeletons/ScreenSkeletons";
import { AuthBackground } from "../components/profile/AuthBackground";
import { useAuthStore } from "../store/authStore";
import { TabRoutes } from "./TabNavigator";

export function AppNavigator() {
  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isHydrating) {
    return (
      <AuthBackground>
        <View style={styles.loading}>
          <AuthScreenSkeleton />
        </View>
      </AuthBackground>
    );
  }

  return (
    <NavigationContainer>
      {user ? <TabRoutes /> : <AuthScreen />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "transparent"
  }
});
