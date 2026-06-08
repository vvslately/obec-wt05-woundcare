import React from "react";
import { ImageBackground, StyleSheet } from "react-native";

const backgroundImage = require("../../../assets/background_login_signup.png");

type AuthBackgroundProps = {
  children: React.ReactNode;
};

export function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      imageStyle={styles.image}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  image: {
    width: "100%",
    height: "100%"
  }
});
