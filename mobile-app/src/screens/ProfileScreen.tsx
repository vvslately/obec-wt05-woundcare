import React from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ProfileView } from "../components/profile/ProfileView";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ProfileView user={user} onLogout={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  }
});
