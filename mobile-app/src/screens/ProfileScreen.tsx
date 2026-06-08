import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ProfileView } from "../components/profile/ProfileView";
import { TitleBar } from "../components/TitleBar";
import { ProfileScreenSkeleton } from "../components/skeletons/ScreenSkeletons";
import { useFirstLoadSkeleton } from "../hooks/useFirstLoadSkeleton";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useFirstLoadSkeleton(loading);

  if (!user) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <TitleBar />
      <View style={styles.content}>
        <ProfileView user={user} onLogout={logout} onLoadingChange={setLoading} />
        {showSkeleton ? (
          <View style={styles.skeletonOverlay}>
            <ProfileScreenSkeleton />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1
  },
  skeletonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background
  }
});
