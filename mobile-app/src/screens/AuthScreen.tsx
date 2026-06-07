import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LoginView } from "../components/profile/LoginView";
import { RegisterView } from "../components/profile/RegisterView";
import { colors } from "../theme/colors";

type AuthMode = "login" | "register";

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {mode === "login" ? (
        <LoginView onGoRegister={() => setMode("register")} />
      ) : (
        <RegisterView onGoLogin={() => setMode("login")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  }
});
