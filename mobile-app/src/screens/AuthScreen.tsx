import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { AnimatedAuthSwitch } from "../components/profile/AnimatedAuthSwitch";
import { AuthBackground } from "../components/profile/AuthBackground";
import { LoginView } from "../components/profile/LoginView";
import { RegisterView } from "../components/profile/RegisterView";

type AuthMode = "login" | "register";

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [direction, setDirection] = useState(1);

  const goRegister = () => {
    setDirection(1);
    setMode("register");
  };

  const goLogin = () => {
    setDirection(-1);
    setMode("login");
  };

  return (
    <AuthBackground>
      <StatusBar style="dark" />
      <AnimatedAuthSwitch viewKey={mode} direction={direction}>
        {mode === "login" ? (
          <LoginView onGoRegister={goRegister} />
        ) : (
          <RegisterView onGoLogin={goLogin} />
        )}
      </AnimatedAuthSwitch>
    </AuthBackground>
  );
}
